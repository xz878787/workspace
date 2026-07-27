import 'dotenv/config'
import pkg from '@zilliz/milvus2-sdk-node';
const {
  MilvusClient, // c|s  B|C 架构
  IndexType,
  MetricType , // 相似度求方法
  DataType, // 字段数据类型约束
} = pkg;
import {
  OpenAIEmbeddings,
  ChatOpenAI,
} from '@langchain/openai'

const ADDRESS =process.env.MILVUS_ADDRESS
const TOKEN=process.env.MILVUS_TOKEN
const COLLECTION_NAME = 'ai_diary';
const VECTOR_DIM=1024; 

const embedding = new OpenAIEmbeddings({
 apiKey: process.env.OPENAI_API_KEY,
 model: process.env.EMBEDDINGS_MODEL_NAME,
 configuration: {
  baseURL: process.env.OPENAI_BASE_URL,
 },
 dimensions: VECTOR_DIM,
})
const model = new ChatOpenAI({
  temperature: 0.7,
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
})
const client =new MilvusClient({
    address :ADDRESS ,
    token : TOKEN,
    timeout: 60000,
    secure: true
})
const getEmbedding = async (text) => {
  const result = await embedding.embedQuery(text);
  return result;
}
const retrievevRelevantDiaries = async (question,k=2) => {
  try{
    const queryVector =await getEmbedding(question)
    const srarchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: k,
      metric_type: MetricType.COSINE,
      output_fields: ['id','content','date','mood','tags'],
    })
    return srarchResult.results
  }catch(error){
    console.error('Error:', error);
    return [];
  }
}
const answerQuestion = async (question,k=2) => {
  try{
    console.log('='.repeat(50))
    console.log(`问题：${question}`);
    console.log('='.repeat(50))
    // rag 模块化
    console.log("检索相关日记")
    const retrievedDiaries = await retrievevRelevantDiaries(question,k)
    if(retrievedDiaries.length===0){
      console.log("没有找到相关日记")
      return "抱歉，没有找到相关日记。";
    }
    retrievedDiaries.forEach((diary,index)=>{
      console.log(`日记${index+1}相似度${diary.score.toFixed(4)}\n内容：${diary.content}\n`)
    })

    const context = retrievedDiaries.map((diary,i)=>`[日记]${i+1},日期:${diary.date},标签:${diary.tags?.join(', ')},
    心情:${diary.mood},内容:${diary.content},`).join('\n\n----\n\n')
    const prompt =`
     你是一个温暖贴心的ai日记助手。基于用户的日记内容回答问题用情切自然的语言。请根据以下日记内容回答问题：
     ${context}回答要求：
     1. 如果日记中又相关信息，请结合日记内容给出详细，温暖的回答。
     2. 可以总结多篇日记的内容，找出共同点活趋势。
     3. 如果日记中没有相关信息，请温和告知用户。
     4. 用第一人称“你”来称呼日记的作者。
     5. 回答要又同理心，让用户感到被理解和关心。
     ai助手回答:
    `
    return prompt
  }catch(error){
    console.error('Error:', error);
    return "抱歉，处理请求时出错了。";
  }
}
async function main(){
  try{
    console.log("\n\n链接到Milvus数据库")
    await client.connect();  // 先握手
    console.log("Milvus数据库连接成功")
    
    // 加载 collection
    console.log("Loading collection...");
    await client.loadCollection({ collection_name: COLLECTION_NAME });
    console.log("Collection loaded");
    
    const prompt = await answerQuestion("我最近做了什么让我感到快乐的事情");
    console.log('[ai回答]');
    const response = await model.invoke(prompt);
    console.log(response.content)
  }catch(error){
    console.error('Error:', error);
  }
}
main().catch(console.error)