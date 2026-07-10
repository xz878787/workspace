import 'dotenv/config';
// agent 配置 mcp client ? 可以配置多个mcp server的client
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import { 
  HumanMessage, 
  SystemMessage, 
  ToolMessage 
} from '@langchain/core/messages';

const model = new ChatOpenAI({
  modelName:'deepseek-v4-pro',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    'my-mcp-server': {
      command: 'node',
      args: ['D:/workspace/sw_ai/ai/agent_in_action/mcp-demo/src/my-mcp-server.mjs'],
    }
  }
})
// 获取工具
const tools = await mcpClient.getTools();
const res= await mcpClient.listResources();
let resourceContent='';
for(const [serverName,resources] of Object.entries(res)){
 for(const resource of resources){
  const content= await mcpClient.readResource(
    serverName,resource.uri 
  )
  resourceContent += content[0].text;
 }
}
console.log(resourceContent,'---------------');
const modelWithTools = model.bindTools(tools);

async function runAgentWithTools(query, maxIterations=30) {
 const messages= [
  new SystemMessage(resourceContent),
  new HumanMessage(query),
 ]  ;
 for( let i=0;i< maxIterations ;i++){
console.log(chalk.bgGreen(`正在等待AI思考,第${i}轮...`))
const response = await modelWithTools.invoke(messages);
messages.push(response);

if (!response.tool_calls || response.tool_calls.length === 0) {
  console.log(`\n AI 最终回复 : \n ${response.content}`);
  return response.content;
}


console.log(chalk.bgBlue.bgBlue(`检测到
  ${response.tool_calls.length}个调用工具`));
  console.log(chalk.bgBlue.bgBlue(`调用工具列表 : 
    ${response.tool_calls.map(t => t.name).join(', ')} `));

    for( const toolCall of response.tool_calls){
      // find 方法 匹配的哪一项， 如果找到了， 后面不会执行
      const foundTool= tools.find(t => 
        t.name === toolCall.name);
        if(foundTool){
          const toolResult = await foundTool.invoke(
            toolCall.args);
            messages.push(new ToolMessage({
              content: toolResult,
              tool_call_id: toolCall.id

            }))
          
        }
    }

}
//循环的次数(轮数) 达到30次,任无法回复问题， 返回最后一轮
return messages[messages.length-1].content;
}

await runAgentWithTools(' MCP Server 使用说明指南是什么?');


//关闭所有 MCP 子进程与通信的通道 ， 释放进程资源
// 关闭和MCP Server 的通信通道
// my-mcp-server.mjs  被启动了，手动关闭进程
// 释放相关资源， 避免脚本一直挂着不退出
// node langchain-mcp-test.mjs 启动进程
  // 启动一个子进程 child-process
  // 子进程连接 my-mcp-server.mjs
  // 主进程通过stdio 和他们通话

await mcpClient.close();
