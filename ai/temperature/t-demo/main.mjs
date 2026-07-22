import 'dotenv/config'
import {ChatOpenAI} from '@langchain/openai'
// 把大模型输出解析成纯字符
// chain 上  不用那么复杂， 直接给我们content 内容
import {StringOutputParser}  from '@langchain/core/output_parsers';
// prompt 好复用
// 以前是硬编码， 写在代码里面， 不太好维护， 不好模块化
// agent 中 很多业务都是prompt 驱动的， 不同的用户， 是同一套
// ai 业务， 只需要换身份就好， PromptTemplate
// 会在AI 工作流的比较前的位置
import {PromptTemplate} from '@langchain/core/prompts';
// llm 
// 创意性更多的
const creativeModel = new ChatOpenAI({
    model:'deepseek-v4-flash',
  temperature: 0.8,// 增强创意的发散性
  topk:4,// 取前4个概率最高的词汇采样，限制跑偏
  maxToken:600,// 最大token 数
  apiKey:process.env.DEEPSEEK_API_KEY,
  configuration:{
    baseURL:'https://api.deepseek.com',
  }
})
// 严谨的
const preciseModel = new ChatOpenAI({
    model:'deepseek-v4-flash',
    temperature: 0.3,
    topk:8,  //更大的TopK， 保证信息的完整性
    maxToken:600,
    apiKey:process.env.DEEPSEEK_API_KEY,
    configuration:{
      baseURL:'https://api.deepseek.com',
    }
  
})

const storyPrompt=PromptTemplate.fromTemplate(`
请写一篇短篇散文， 主题：{theme}
风格温柔
`)


// 输入解析器， 统一返回存文本
const outputParser=new StringOutputParser()
// 工作流 pip 一下  工作流的流转
// AI 工程复杂 设计好了AI 工作流
const creativeChain=storyPrompt
.pipe(creativeModel)
.pipe(outputParser)
//各种的AI 工作流生产路线
const preciseChain=storyPrompt
.pipe(creativeModel)
.pipe(outputParser)

// 原料送到流水线生产 ?
async function runWriteDemo(){
    const theme="秋日山野晚风";

    console.log('创意写作模式');
    const creativeText= await creativeChain.invoke({theme});
    console.log(`创意文本：${creativeText}`);
    console.log('严谨写作模式');
    const preciseText= await preciseChain.invoke({theme});
    console.log(`严谨文本：${preciseText}`);
}

runWriteDemo()
.catch(err=>console.error(err))
