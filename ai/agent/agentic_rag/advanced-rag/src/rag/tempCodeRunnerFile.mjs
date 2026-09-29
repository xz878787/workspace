// hybrid-retrieval.mjs：ES BM25 + Milvus 向量 + DashScope Rerank 的混合检索 demo
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
// 显式定位 .env（在 advanced-rag/ 根目录），无论从哪个 cwd 跑都能加载
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

import { Client } from "@elastic/elasticsearch"
import { Document } from "@langchain/core/documents"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { Milvus } from "@langchain/community/vectorstores/milvus"
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { Annotation, START, StateGraph } from "@langchain/langgraph";
import { DashscopeRerank } from "../rerank/dashscope-rerank.mjs"
import {
  augmentQuery,
  retrievalQueryString
} from "./query-agument.mjs"

const INDEX = "life_notes"; 
const esClient = new Client({ node: "http://localhost:9200"});
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-v3",
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  }
});

// 延迟初始化 Milvus：Docker 没起时不崩，等真正要用时才连接
let milvusStore;
async function getMilvus() {
  if (milvusStore !== undefined) return milvusStore;
  try {
    milvusStore = await Milvus.fromExistingCollection(embeddings, {
      url: "http://localhost:19530",
      collectionName: INDEX,
      textField: "doc_text",
      vectorField: "embedding"
    });
    console.log("✅ Milvus 连接成功");
  } catch (e) {
    console.warn("⚠️  Milvus 未就绪，向量召回将跳过:", String(e.message).split('\n')[0]);
    milvusStore = null;
  }
  return milvusStore;
}

const reranker = new DashscopeRerank({
  apiKey: process.env.OPENAI_API_KEY,
  model: "qwen3-rerank",
  topN: 3,
  baseUrl: process.env.RERANK_URL
});

const chatModel = new ChatOpenAI({
  model: process.env.MODEL_NAME ?? "qwen-turbo",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  }
})

const HybridRetrievalState = Annotation.Root({
  query: Annotation(),
  queryAugmentation: Annotation(),
  esHits: Annotation(),
  milvusHits: Annotation(), 
  merged: Annotation(),
  topDocuments: Annotation(),
  answer: Annotation()
});

function docFromEsHit(hit) {
  const s = hit._source ?? {};
  const text = [s.note_title ?? s.title, s.note_body ?? s.content]
    .filter(Boolean).join("\n");
  return new Document({
    pageContent: text,
    metadata: { id: hit._id, source: "es", ...s }
  })
}

function merge(esDocs, milvusDocs) {
  const combined = [...(esDocs ?? []), ...(milvusDocs ?? [])]
    .filter(d => d?.pageContent);
  return dedupeDocsById(combined);
}

function dedupeDocsById(docs) {
  const seen = new Set();
  const output = [];
  for (const d of docs ?? []) {
    if (!d?.pageContent) continue;
    const id = d.metadata.id != null ? String(d.metadata.id).trim() : "";
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    output.push(d);
  }
  return output;
}

function printDocs(label, docs) {
  console.log(`\n=== ${label} (${docs?.length ?? 0}条) ===`)
  for (let i = 0; i < (docs ?? []).length; i++) {
    const d = docs[i];
    const preview = (d.pageContent ?? "").slice(0, 200).replace(/\n/g, " ");
    console.log(`[${i}] ${preview} ${d.pageContent?.length > 200 ? "..." : ""}`);
    console.log(`  metadata:`, d.metadata ?? {});
  }
}

function printQueryRewrite(original, augmentation) {
  const qs = augmentation.queries ?? [];
  console.log(`\n---查询扩展(LLM 生成 ${qs.length}条检索问句)`);
  qs.forEach((q, i) => console.log(`  [${i}] ${q}`));
}

function stringifyMessageContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");
  return content
    .map(c => typeof c === "string" ? c : typeof c?.text === "string" ? c.text : "")
    .join("");
}

const ANSWER_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `你是阅读用户[生活笔记]知识库并作回答的助手。
规则：
- 只根据下方[检索片段]推断答案；片段里没有的信息不要编造。
- 若片段不足以回答问题，明确说明[笔记里没提到]，并可给出一句保守建议。
- 回答简洁有条理，可使用简短列表，口吻自然中文。`],
  ["human", `用户问题：{query}\n检索片段：\n{context}`]
]);

const NO_CONTEXT_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `你是阅读用户[生活笔记]知识库并作回答的助手。当前没有检索到任何片段。
请用一两句话说明无法从笔记中回答，并礼貌询问用户是否换个说法或补充关键词。`],
  ["human", "用户问题：{query}"]
]);

function formatDocsAsContext(docs) {
  return (docs ?? [])
    .map((d, i) => {
      const meta = d.metadata ?? {};
      const src = meta.source ?? "";
      const id = meta.id != null ? String(meta.id) : "";
      const head = id ? `[${i + 1}] id=${id}${src ? ` source=${src}` : ""}` : `[${i + 1}]`;
      return `${head}\n${d.pageContent ?? ""}`;
    })
    .join("\n\n---\n\n");
}

export function compileHybridRetrievalGraph(esClient, reranker, chatModel) {
  const ES_K = 15;
  const MILVUS_K = 15;
  return new StateGraph(HybridRetrievalState) 
    .addNode("query_augment", async (state) => ({
      queryAugmentation: await augmentQuery(chatModel, state.query ?? "")
    }))
    .addNode("es_recall", async (state) => {
      try {
        const qs = retrievalQueryString(state.query, state.queryAugmentation);
        const n = Math.max(1, qs.length);
        const kEach = Math.max(2, Math.ceil(ES_K / n));
        const batches = await Promise.all(
          qs.map(q => esClient.search({
            index: INDEX,
            size: kEach,
            query: {
              multi_match: {
                query: q,
                fields: ["note_title^2", "note_body", "title", "content"],
                type: "best_fields",
                analyzer: "ik_smart"
              }
            }
          }).catch(() => null))
        );
        const flat = batches
          .filter(Boolean)
          .flatMap((res) => (res.hits?.hits ?? []).map(docFromEsHit));
        return { esHits: dedupeDocsById(flat) }
      } catch (e) {
        console.warn("⚠️  ES 检索失败，跳过:", String(e.message).split('\n')[0]);
        return { esHits: [] };
      }
    })
    .addNode("milvus_recall", async (state) => {
      try {
        const milvus = await getMilvus();
        if (!milvus) return { milvusHits: [] };
        const qs = retrievalQueryString(state.query, state.queryAugmentation);
        const n = Math.max(1, qs.length);
        const kEach = Math.max(2, Math.ceil(MILVUS_K / n));
        const batches = await Promise.all(
          qs.map((q) => milvus.similaritySearch(q, kEach).catch(() => []))
        );
        const flat = batches.flat();
        return { milvusHits: dedupeDocsById(flat) };
      } catch (e) {
        console.warn("⚠️  Milvus 检索失败，跳过:", String(e.message).split('\n')[0]);
        return { milvusHits: [] };
      }
    })
    .addNode("merge", async (state) => ({
      merged: merge(state.esHits, state.milvusHits)
    }))
    .addNode("rerank", async (state) => {
      try {
        const merged = state.merged ?? [];
        if (!merged.length) return { topDocuments: [] };
        const topDocuments = await reranker.compressDocuments(merged, state.query);
        return { topDocuments };
      } catch (e) {
        console.warn("⚠️  Rerank 失败，跳过精排:", String(e.message).split('\n')[0]);
        // 降级：直接取 merge 后的前 3 条
        const merged = state.merged ?? [];
        return { topDocuments: merged.slice(0, 3) };
      }
    })
    .addNode("generate_answer", async (state) => {
      const query = state.query ?? "";
      const docs = state.topDocuments ?? [];
      if (!docs.length) {
        const chain = NO_CONTEXT_PROMPT.pipe(chatModel);
        const msg = await chain.invoke({ query });
        return { answer: stringifyMessageContent(msg.content).trim() };
      }
      const chain = ANSWER_PROMPT.pipe(chatModel);
      const msg = await chain.invoke({ query, context: formatDocsAsContext(docs) });
      return { answer: stringifyMessageContent(msg.content).trim() };
    })
    .addEdge(START, "query_augment")
    .addEdge("query_augment", "es_recall")
    .addEdge("query_augment", "milvus_recall")
    .addEdge(["es_recall", "milvus_recall"], "merge")
    .addEdge("merge", "rerank")
    .addEdge("rerank", "generate_answer")
    .compile()
}

// 主入口
const graph = compileHybridRetrievalGraph(esClient, reranker, chatModel);
const drawable = await graph.getGraphAsync();
console.log(drawable.drawMermaid());

const query = "家里无线老是断断续续的咋整啊";
const state = await graph.invoke({ query });
printQueryRewrite(state.query, state.queryAugmentation);
printDocs("Elasticsearch 检索", state.esHits);
printDocs("Milvus 检索", state.milvusHits);
printDocs("重排后保留", state.topDocuments ?? []);
console.log("\n大模型生成回答");
console.log(state.answer);
