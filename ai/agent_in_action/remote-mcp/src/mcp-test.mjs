import 'dotenv/config';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import {
    HumanMessage,
    SystemMessage,
    ToolMessage
} from '@langchain/core/messages';

const model = new ChatOpenAI({
  modelName:'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});

const mcpClient = new MultiServerMCPClient({
    mcpServers: {
        'amap-maps': {
            "url": "https://mcp.amap.com/mcp?key=f58f8879063a5f61df94bbb40a6305cb"
        },
        'my-mcp-server': {
            command: "node",
            args: [
                "D:/workspace/sw_ai/ai/agent_in_action/mcp-demo/src/my-mcp-server.mjs"
            ]
        },
        'filesystem': {
            command: 'npx',
            args: [
                '-y',
                '@modelcontextprotocol/server-filesystem',
                'D:/workspace/sw_ai/ai/agent_in_action/remote-mcp'
            ]
        },
        'chrome-devtools': {
            command: 'npx',
            args: [
                '-y',
                'chrome-devtools-mcp@latest',
            ]
        }
    }
});

const tools = await mcpClient.getTools();
console.log(chalk.green(`已加载 ${tools.length} 个工具`));

const res = await mcpClient.listResources();
let resourceContent = '';
for (const [serverName, resources] of Object.entries(res)) {
    for (const resource of resources) {
        const content = await mcpClient.readResource(serverName, resource.uri);
        resourceContent += content[0].text;
    }
}

// 任务指导：明确告诉 AI 执行步骤
const taskInstruction = `
你是一个智能旅行助手，请按以下步骤完成用户请求：
1. 使用 maps_geo 获取地点坐标（例如：北京南站）
2. 使用 maps_around_search 搜索附近酒店（keywords=酒店, radius=1000），最多选3个有图片的酒店
3. 使用 chrome-devtools 的 new_page 和 navigate_page 工具，在浏览器中打开每个酒店的图片URL
4. 每个酒店打开一个新 tab，页面标题设为酒店名称

注意：
- 高德 API QPS 限制为3，每轮最多调用3个高德工具
- 工具调用之间要有间隔，避免超限
- 优先选择有 photo 字段的酒店
- 不要调用无关工具（如天气、路线规划等）
`;

const modelWithTools = model.bindTools(tools);

async function runAgentWithTools(query, maxIterations = 30) {
    const messages = [
        new SystemMessage(resourceContent + taskInstruction),
        new HumanMessage(query),
    ];

    for (let i = 0; i < maxIterations; i++) {
        console.log(chalk.bgGreen(`正在等待AI思考,第${i}轮...`));

        const response = await modelWithTools.invoke(messages);
        messages.push(response);

        if (!response.tool_calls || response.tool_calls.length === 0) {
            console.log(`\n AI 最终回复 : \n ${response.content}`);
            return response.content;
        }

        console.log(chalk.bgBlue(`检测到 ${response.tool_calls.length} 个工具调用`));

        for (const toolCall of response.tool_calls) {
            const foundTool = tools.find(t => t.name === toolCall.name);
            if (foundTool) {
                console.log(chalk.cyan(`  调用 ${toolCall.name}`));
                try {
                    const toolResult = await foundTool.invoke(toolCall.args);
                    const contentStr = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
                    console.log(chalk.cyan(`  返回成功`));
                    messages.push(new ToolMessage({
                        content: contentStr,
                        tool_call_id: toolCall.id
                    }));
                } catch (error) {
                    console.log(chalk.red(`  调用失败: ${error.message}`));
                    messages.push(new ToolMessage({
                        content: `工具调用失败: ${error.message}`,
                        tool_call_id: toolCall.id
                    }));
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    return messages[messages.length - 1].content;
}

await runAgentWithTools(`麻丘站地铁站附近的酒店，最近的 3 个酒店，拿到酒店图片，打开浏览器，展示每个酒店的图片，每个 tab 一个 url 展示，并且在把那个页面标题改为酒店名`);

await mcpClient.close();