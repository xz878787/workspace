import "dotenv/config";
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

const model = new ChatOpenAI({
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

let vectorStore;
const TOP_K = 5;

const GraphState = Annotation.Root({
  question: Annotation,
  k: Annotation,
  strategy: Annotation,// 枚举
  routeReason: Annotation,
  subQuestions: Annotation,//question[i]
  nextSubIdx: Annotation,// 当前子问题
  currentQuery: Annotation,// 当前正在检索的子问题
  retrievalCount:Annotation,
  maxRetrievalCount: Annotation,
  planedNext: Annotation,//枚举
  documents: Annotation,//分批次的检索结果
  generation: Annotation
})

const RouteSchema = z.object({
  // 枚举
  strategy: z.enum(["simple", "complex"]),
  reason: z.string()
});
// llm 完成问题的分辨
// RouteSchema 结构化输出约束
const routeQuestionNode = async (state) => {
  console.log('___ROUTE-QUESTION___');
  // 结构化输出
  const router = model.withStructuredOutput(RouteSchema);
  const route = await router.invoke(`
  你是问答路由器，请判断用户问题是否需要外部检索。

  规则：
  - simple: 常识问答、简短定义、无需特定小说细节即可回答。
  - complex: 需要《天龙八部》具体情节、任务关系、章节事实、原文细节或证据支持。
  
  用户问题： ${state.question}
  `);
 
  console.log(`路由策略：${route.strategy} ${route.reason}`)
  return {
    question: state.question,
    k: state.k,
    strategy: route.strategy,
    routeReason: route.reason,
    retrievalCount: 0,
    maxRetrievals: state.maxRetrievals ?? 8,
    documents: [],
    subQuestions: [],
    nextSubIdx: 0,
    currentQuery: "",
  }
}

const directAnswerNode = async (state) => {
  console.log('----DIRECT_ANSWER----');
  process.stdout.write("\n [AI 回答（流式）] \n");
  let generation = "";
  const stream = await model.stream(`你是一个中文回答助手,
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
    question: state.question,
    k: state.k,
    strategy: state.strategy,
    routeReason: state.routeReason,
    documents: [],
    generation
  }
}

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

const DecomposeSchema = z.object({
  sub_questions:z.array(z.string()).min(1).max(8),
  reason: z.string()
})


// plan llm +prompt
//给他身份
const decomposeQuestionNode = async (state) => {
  console.log('----DECOMPOSE_QUESTION----');
  const decomposer = model.withStructuredOutput(DecomposeSchema);
  const out = await decomposer.invoke(`
    你是《天龙八部》多跳问答的【子问题拆解器】。
    用户原始问题：
    ${state.question}

    任务：将问题拆成**有序**子问题列表 sub_questions, 用于**依次向量检索**。要求：
    1. 链式推理、多层关系、应果先后的问题，必须拆成多条；单跳即可答的也可只输出1条。
    2. 每条子问题必须是**可独立检索**的完整中文问句，**禁止**使用「他/她/此人/上文」等指代；可写全人物名与事件名。
    3. 顺序必须符合推理链：先搞清前置实体/事实，再查后续结论。
    4. **不要**把整句原题原样复制成唯一一条（除非确实无法拆分）；不要拆成过碎的关键词列表。
    5. 输出 1～8 条即可。

    请输出 sub_questions 与简短 reason。
  `);

  // 去空格， 排除不需要的question
  const subQuestion = out.sub_questions.map((s) => s.trim()).filter(Boolean);
  if (subQuestion.length === 0) {
    throw new Error("decompose_question: sub_questions 为空")
  }

  console.log(`拆解${subQuestion.length}条子问题：${out.reason}`)
  subQuestion.forEach((q, i) => {
    console.log(`[${i + 1}] ${q}`);
  });
  return {
    subQuestions: subQuestion,
    nextSubIdx: 0,
    currentQuery: subQuestion[0],
  }
}

const mergeUnique = (existingDocs, newDocs) => {
    // map key 可以是对象
    // has get
    const map = new Map();// es6 新增的HashMap 数据结构key:value
    for (const d of [...existingDocs, ...newDocs]) {
      const key = String(d.id);
      const prev = map.get(key);
      if (!prev || Number(d.score) > Number(prev.score)) {
        map.set(key, d);
      }
    }
    return [...map.values()];// 去重后的文档数组
}
const retrieveNode = async (state) => {
    const subs= state.subQuestions ??[];
    const idx = state.nextSubIdx ?? 0;
    const q= subs[idx]?.trim();//当前这一轮的问题 
    if(!q) {
      throw new Error(`retrieve:子问题下标${idx} 有无效文本
        (共${subs.length}条子问题)`)
    }

const round = state.retrievalCount + 1;
console.log(`----第${round}轮， 子问题 ${idx+1}/${subs.length}----`)
console.log(`---查询${q}---`)
const newDocs= await retrieveRelevantContent(q, state.k);
// 多轮retrieve 有可能重复， 会浪费资源
// 重复可能让llm 重复回答
const merged = mergeUnique(state.documents ?? [], newDocs);
if (newDocs.length ===0 ){
    console.log(`本轮未命中相关文档`)
}else{
    console.log(`本轮命中${newDocs.length}条,累计去重后${merged.length}条`);
newDocs.forEach((item, i) => {
  const preview = item.content.length > 120
    ? `${item.content.substring(0, 120)}...`
    : item.content;
    console.log(`[R${i+1}] score=${Number(item.score).toFixed(4)} 
    chapter=${item.chapter_num} index=${item.index}
    `)
})
}
return {
  documents: merged,
  retrievalCount: round,
  nextSubIdx: idx + 1,
  currentQuery: q
}
}

const NextStepSchema = z.object({
  nextAction: z.enum(["generate", "retrieve"]),
  reason: z.string()
})

// 条件边函数：根据规划器写入 state 的决策决定下一跳
// 注意不能读 state.strategy（那是路由的 simple/complex），要读规划器的 planedNext
const afterPlan = (state) => (state.planedNext === "retrieve" ? "retrieve" : "generate")

const planNextStepNode= async(state)=>{
  console.log('----PLAN_NEXT_STEP----');
  const subs = state.subQuestions ?? [];
  const nextIdx= state.nextSubIdx ?? 0;
  const remaining = subs.length- nextIdx;

  const subList = subs.map((s, i) => `[${i+1}] ${s}
    ${i<nextIdx ? "已检索" : i===nextIdx ? "(下一轮将检索，若选择继续)" :
    "未检索"}`).join("\n");

    const docStr = state.documents.length ===0
    ? "(尚无检索结果)"
    : state.documents
    .slice(0,6)
    .map((d,i)=>
      `[${i+1}] score=${Number(d.score).toFixed(4)} 第${d.chapter_num}章
      ${d.content.slice(0,200)}`
    ).join("\n\n");
  
    const prompt= `你是多跳 RAG 规划器。 检索查询已由前置步骤拆解为**有序子问题** 
    若需要继续检索， 下一轮将自动使用 [下一条子问题] 做向量检索， 你 **不要** 
    自拟新的检索句。
    用户原始问题： ${state.question}
    子问题序列：
    ${subList || "无"}

   已检索轮次: ${state.retrievalCount}; 剩余未检索子问题条数: ${remaining}
   最大检索轮数上限: ${state.maxRetrievalCount}

   已召回文档摘要:
   ${docStr}

   请判断下一步:
   1)  已有足够依赖回答用户原始问题 -> nextAction = generate
   2)  仍缺关键事实、 且仍存在未检索的子问题、且未超过轮数上限 -> nextAction= retrieve
   硬性规则：
   - 若剩余未检索子问题条数为0， 必须 nextAction= generate.
   - 若已检索轮数已经到达或超过最大检索轮数， 必须nextAction= generate
   `;
   const planeModel= model.withStructuredOutput(NextStepSchema);
   const {nextAction,reason}= await planeModel.invoke(prompt);

   let finalNext = nextAction;
   if(state.retrievalCount >= state.maxRetrievalCount) finalNext = "generate";
   if(remaining <= 0) finalNext = "generate";
   console.log(`[决策] nextAction=${finalNext} (LLM建议: ${nextAction}) 原因: ${reason}`)
   // 必须把决策写回 state，条件边 afterPlan 才能读到
   return {
     planedNext: finalNext
   }
}


const generateNode = async (state) => {
  const context = state.documents
    .map((item, i) => `[片段 ${i+1}]
    章节: 第 ${item.chapter_num}章
    内容：${item.content}
    `).join("\n\n----------\n\n")
  const prompt = `
  你是一个专业的《天龙八部》小说助手。基于小说内容回答问题，用准确，详细的语言。
  请根据以下《天龙八部》小说片段内容回答问题：
  ${context}
  用户问题：${state.question}

  回答要求：
  1. 如果片段中有相关信息，请结合小说内容给出详细、准确的回答
  2. 可以综合多个片段的内容，提供完整的答案
  3. 如果片段中没有相关信息，请如实告知用户
  4. 回答要准确，符合小说的情节和人物设定
  5. 可以引用原文内容来支持你的回答

  AI 助手的回答：
  `
  process.stdout.write("\n[AI回答（流式）]\n");
  let generation = "";
  const stream = await model.stream(prompt);
  for await (const chunk of stream) {
    const text = typeof chunk.content === "string"?chunk.content: "";
    if (!text) continue;
    generation += text;
    process.stdout.write(text);
  }
  process.stdout.write("\n");

  return {
    question: state.question,
    k: state.k,
    documents: state.documents,
    generation
  }
}

const afterRoute = (state) => (state.strategy === 'simple'? "direct_answer" : "decompose_question")

const graph = new StateGraph(GraphState)
  .addNode("route_question", routeQuestionNode)
  .addNode("direct_answer", directAnswerNode)
  .addNode("decompose_question", decomposeQuestionNode)
  .addNode("retrieve", retrieveNode)
  .addNode("plan_next_step", planNextStepNode)//
  .addNode("rag_generate", generateNode)
  .addEdge(START, "route_question")
  .addConditionalEdges("route_question", afterRoute, {
    direct_answer: "direct_answer",
    decompose_question: "decompose_question"
  })
  .addEdge("decompose_question", "retrieve")/// 拆解后，继续检索
  .addEdge("retrieve", "plan_next_step")
  .addConditionalEdges("plan_next_step", afterPlan, {
    retrieve: "retrieve",
    generate: "rag_generate"
  })
  // .addEdge("retrieve", "rag_generate")
  .addEdge("direct_answer", END)
  .addEdge("rag_generate", END)
  .compile();

const drawable = await graph.getGraphAsync();
const mermaid = drawable.drawMermaid({ withStyles: true });
console.log(mermaid);



async function main () {
  // const question = "1+1=?";
  const question = "阿朱是怎么死的？,那个时候虚竹怎么了";
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
    console.log("集合已加载;")
  } catch(error) {
    if (!error.message.includes("already loaded")) {
      throw error
    }
    console.log('集合已经处于加载状态');
  }

  const result = await graph.invoke({
    question,
    k: Number.isFinite(k)?k:TOP_K,
    strategy: "",
    routeReason: "",
    subQuestions: [],
    nextSubIdx: 0,
    currentQuery: "",
    retrievalCount: 0,
    maxRetrievalCount: 3,
    planedNext: "",
    documents: [],
    generation: ""
  });

  console.log(JSON.stringify(result, null, 2));

}

main()
  .catch(err => console.error(err))