import 'dotenv/config'
import pkg from '@zilliz/milvus2-sdk-node';
const {
  MilvusClient, // c|s  B|C 架构
  IndexType,
  MetricType, // 相似度求方法
  DataType, // 字段数据类型约束
} = pkg;
import {
  OpenAIEmbeddings,
} from '@langchain/openai'

const ADDRESS = process.env.MILVUS_ADDRESS;
const TOKEN = process.env.MILVUS_TOKEN;
const COLLECTION_NAME = 'ai_diary';

const embedding = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN,
  timeout: 60000,
  secure: true
});

const getEmbedding = async (text) => {
  const result = await embedding.embedQuery(text);
  return result;
}


async function main() {
  try {
    console.log("\n\nConnection to Milvus...")
    await client.connectPromise; //链接milvus 在操作
    console.log("Connected successfully");
    
    // 加载 collection
    console.log("Loading collection...");
    await client.loadCollection({ collection_name: COLLECTION_NAME });
    console.log("Collection loaded");
    
    const query = "我想看看关于户外活动的日记";
    console.log("Query:" + query);
    const queryVector = await getEmbedding(query);
    
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      limit: 2,
      vector: queryVector,
      output_fields: ['id', 'content', 'date', 'mood', 'tags'],
    });
    console.log(`Search ${searchResult.results.length} records search\n`)
    searchResult.results.forEach((item, index) => {
      console.log(`Record ${index + 1}:[Score:${item.score.toFixed(4)}]`)
      console.log(`ID: ${item.id}
        Content: ${item.content}
        Date: ${item.date}
        Mood: ${item.mood}
        Tags: ${item.tags?.join(', ')}
        `)
    })
  } catch (err) {
    console.error(err)
  }
}

main().catch(console.error)