import dotenv from "dotenv";
// 相对脚本文件定位 .env，无论从哪个目录启动都能加载
import { fileURLToPath } from "url";
import path from "path";
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env")
});
import {
  ChatOpenAI, 
  OpenAIEmbeddings
} from "@langchain/openai";
import {
  Annotation,
  END,
  START,
  StateGraph
} from '@langchain/langgraph';
import { Milvus } from '@langchain/community/vectorstores/milvus';
import { z } from 'zod';

let vectorStore;
const TOP_K = 5;

const GraphState = Annotation.Root({
  question: Annotation,
  k: Annotation,
  strategy: Annotation,
  routeReason: Annotation,
  // 召回
  retrievedDocs: Annotation,
  localContext: Annotation, // RAG 上下文 
  webContext: Annotation, // 网络搜索上下文 
  evaluation: Annotation, // { enough, missing, reason}
  generation: Annotation
})

const llm = new ChatOpenAI({
  model: process.env.MODEL_NAME,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  apiKey: process.env.OPENAI_API_KEY
});
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-v3",
  dimensions: 1024,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  apiKey: process.env.OPENAI_API_KEY
});

async function retrieveRelevantContent(question, k = TOP_K) {
  try {
    const docsWithScores = 
      await vectorStore.similaritySearchWithScore(question, k);
    return docsWithScores.map(([doc, score]) => ({
      score,
      content: doc.pageContent,
      id: doc.metadata?.id ?? "unknown",
      book_id: doc.metadata?.book_id ?? "未知",
      chapter_num: doc.metadata?.chapter_num ?? "未知",
      index: doc.metadata?.index ?? "未知"
      // doc.pageContent 
      // doc.metadata 相关的字段
    }))
  } catch(error) {
    console.error("检索内容时出错：", error.message);
    return [];
  }
}

const RouteSchema = z.object({
  // 枚举
  strategy: z.enum(["simple", "complex"]),
  reason: z.string()
});

const routeQuestionNode = async (state) => {
  console.log('___ROUTE-QUESTION___');
  // 结构化输出
  const router = llm.withStructuredOutput(RouteSchema);
  const route = await router.invoke(`
  你是问答路由器，请判断用户问题是否需要外部检索。

  规则：
  - simple: 常识问答、简短定义、无需特定小说细节即可回答。
  - complex: 需要《天龙八部》具体情节、任务关系、章节事实、原文细节或证据支持。
  
  用户问题： ${state.question}
  `);
 
  console.log(`路由策略：${route.strategy} ${route.reason}`)
  // 可选的， 不需要全部state 的设置 
  //  为后面的节点提供服务的 
  return {
    strategy: route.strategy,
    routeReason: route.reason
  }
}

const directAnswerNode = async (state) => {
  console.log('----DIRECT_ANSWER----');
  process.stdout.write("\n [AI 回答（流式）] \n");
  let generation = "";
  const stream = await llm.stream(`你是一个中文回答助手,
  请直简洁回答问题。
  问题：${state.question}
  `)
  for await (const chunk of stream) {
    const text = typeof chunk.content === 'string'?chunk.content:"";
    if (!text) continue;
    generation += text;
    process.stdout.write(text);
  }
  process.stdout.write("\n");
  return {
    generation
  }
}

const retrieveLocalNode = async (state) => {
  console.log("---LOCAL_RETRIEVE---");
  const retrievedDocs = await retrieveRelevantContent(state.question, state.k);
  console.log(`本地检索命中:${retrievedDocs.length}条`);
  const localContext = (retrievedDocs ?? []).map((d) => d.content).join("\n\n");
  return {
    retrievedDocs,
    localContext
  }
}

const EvaluateSchema = z.object({
  enough: z.boolean(), // 是否足够生成，web search
  missing: z.array(z.string()).max(6), // 上下文缺的方面
  reason: z.string(),
  web_query: z.string().optional() // 可选的 web 搜索的关键词
})

// 评估节点
const evaluateNode = async (state) => {
  const hasWeb = Boolean(state.webContext && String(state.webContext).trim());
  console.log(hasWeb ? "---EVALUATE_CONTEXT_WITH_WEB---": "---EVALUATE_LOCAL_CONTEXT---");
  // llm 大脑， 规划， 分析， 分步骤
  const evaluator = llm.withStructuredOutput(EvaluateSchema);
  const out = await evaluator.invoke(`
    你是信息充分性评估器。判断当前上下文是否足以回答用户问题。
    用户问题： ${state.question}
    已检索上下文(来自本地知识库) :
    ${state.localContext || "  (空) "}
    ${hasWeb ? `联网搜索结果:\n ${state.webContext || "  (空) "}`: ""} 

    输出字段：
    - enough: 是否足够回答(true/false)
    - missing: 若不够，列出缺失信息点（最多6条）
    - reason: 简短原因
    ${hasWeb ? "": 
      "- web_query: 若不够， 给出一个适合互联网搜索的中文查询句（完整句， 不用代码： 为空也可）"}
  `);
  console.log(`${hasWeb ? "二次评估": "评估"}: 
    enough=${out.enough} (${out.reason})`);
  if (!out.enough && out.missing?.length) {
    out.missing.forEach((m, i) => console.log(`缺失 ${i+1}: ${m}`))
  }
  // 直接存对象，条件边里免 JSON.parse
  return {
    evaluation: out
  }
}

// 评估条件边：够 -> 生成；不够且没联网过 -> 联网兜底；搜过还不够 -> 诚实生成
const afterEvaluate = (state) => {
  if (state.evaluation?.enough) return "generate";
  if (!state.webContext) return "web_search";
  return "generate";
}

const afterRoute = (state) => (state.strategy === 'simple'? "direct_answer" : "local_retrieve")

// ==================== 网络搜索兜底 ====================
// Tavily REST（免费额度）；国内可替换为博查 API，只改这个函数
async function webSearch(query) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    return "(网络搜索不可用：未配置 TAVILY_API_KEY)";
  }
  try {
    const resp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        query,
        max_results: 5,
        search_depth: "basic"
      })
    });
    if (!resp.ok) {
      return `(网络搜索失败：HTTP ${resp.status})`;
    }
    const data = await resp.json();
    // 摘要截断 + 来源标注，网页内容只当数据不当指令（防 prompt 注入）
    return (data.results ?? []).map((r, i) =>
      `[网络结果${i + 1}] 来源：${r.url}\n${String(r.content ?? "").slice(0, 300)}`
    ).join("\n\n");
  } catch (error) {
    return `(网络搜索失败：${error.message})`;
  }
}

const webSearchNode = async (state) => {
  console.log("---WEB_SEARCH---");
  // 优先用评估器给出的 web_query，比原始问题更适合互联网搜索
  const query = state.evaluation?.web_query || state.question;
  console.log(`搜索词：${query}`);
  const webContext = await webSearch(query);
  console.log(`${webContext.slice(0, 200)}...`);
  return {
    webContext
  }
}

const generateNode = async (state) => {
 // 增强prompt
 // localContext
 // webContext
 console.log("---GENERATE---");
 const context= [state.localContext, state.webContext]
 .filter(Boolean)// Boolean 函数
 .join("\n\n== 联网补充信息 ==\n\n");
 process.stdout.write("\n [AI 回答（流式）] \n");
 const stream = await llm.stream(`你是一个严谨的中文问答助手。
上下文（本地知识库 + 可选联网补充）：
${context || "(空)"}
用户问题：${state.question}
回答要求：
1.如果上下文足够，给出清晰、可核对的回答，需要时引用片段编号 / URL 来支撑。
2. 如果上下文仍不足以确定关键事实，明确说明"不确定 / 无法从上下文确认"，并说明缺失点。
3. 引用联网补充信息时注明"来自网络搜索"，不得冒充本地知识库内容。
4.不要输出表情符号。

回答:
 `)
 let generation = "";
 for await (const chunk of stream) {
   const text = typeof chunk.content === 'string' ? chunk.content : "";
   if (!text) continue;
   generation += text;
   process.stdout.write(text);
 }
 process.stdout.write("\n");
 return {
   generation
 }
}

// ==================== Graph ====================
// route_question -> (simple) direct_answer -> END
//              -> (complex) local_retrieve -> evaluate_local -> (够) generate -> END
//                                                     └-> (不够) web_search -> evaluate_local（带联网结果复评）
const graph = new StateGraph(GraphState)
  .addNode("route_question", routeQuestionNode)
  .addNode("direct_answer", directAnswerNode)
  .addNode("local_retrieve", retrieveLocalNode)
  .addNode("evaluate_local", evaluateNode)
  .addNode("web_search", webSearchNode)
  .addNode("generate", generateNode)
  .addEdge(START, "route_question")
  .addConditionalEdges("route_question", afterRoute, {
    direct_answer: "direct_answer",
    local_retrieve: "local_retrieve"
  })
  .addEdge("local_retrieve", "evaluate_local")
  .addConditionalEdges("evaluate_local", afterEvaluate, {
    web_search: "web_search",
    generate: "generate"
  })
  .addEdge("web_search", "evaluate_local")
  .addEdge("direct_answer", END)
  .addEdge("generate", END)
  .compile();

const drawable = await graph.getGraphAsync();
const mermaid = drawable.drawMermaid({ withStyles: true });
console.log(mermaid);

async function main() {
  // 创作动机类问题：本地有"阿朱之死"情节，但没有"金庸为什么这么写"，
  // 评估节点会判不够 -> 触发联网兜底，验证完整的 web fallback 链路
  const question = "金庸为什么要安排阿朱死在萧峰手上？";
  const k = 5;
  vectorStore = await Milvus.fromExistingCollection(embeddings, {
    collectionName: "ebook4", // tlbb项目入库的集合（存在Zilliz Cloud）
    url: process.env.MILVUS_ADDRESS,
    textField: "content",
    primaryField: "id",
    vectorField: "vector",
    // 集合建库时用的是 COSINE，搜索时必须一致，否则报 metric type not match
    indexCreateOptions: {
      index_type: "HNSW",
      metric_type: "COSINE",
      params: { M: 8, efConstruction: 64 }
    },
    clientConfig: {
      token: process.env.MILVUS_TOKEN,
      ssl: true
    }
  });

  try {
    await vectorStore.client.loadCollection({
      collection_name: "ebook4"
    });
    console.log("集合已加载;");
  } catch (error) {
    if (!error.message.includes("already loaded")) {
      throw error
    }
    console.log('集合已经处于加载状态');
  }

  const result = await graph.invoke({
    question,
    k: Number.isFinite(k) ? k : TOP_K,
    strategy: "",
    routeReason: "",
    retrievedDocs: [],
    localContext: "",
    webContext: "",
    evaluation: null,
    generation: ""
  });

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(err => console.error(err))
