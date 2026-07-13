# MCP 的真正价值：让 Agent 从“会回答”走向“能接入系统”

## 核心结论

MCP 的价值不只是让大模型多一个工具，而是把工具、资源和模型之间的关系标准化，让 Agent 可以跨进程、跨语言、跨应用地调用外部能力。

在这个项目里，`my-mcp-server.mjs` 暴露了一个用户查询工具 `query_user` 和一个使用指南资源 `docs://guide`。`langchain-mcp-test.mjs` 再通过 `MultiServerMCPClient` 启动这个 MCP Server 子进程，用 stdio 建立通信，先读取资源作为上下文，再把工具绑定给模型。最终，用户只需要说“给我001号的信息”，Agent 就可以调用 MCP 工具，从服务端返回张三的用户信息。

截图里的 TRAE 工作区也印证了这条链路：MCP 面板中 `my-mcp-server` 已启用，右侧 Agent 收到“给我001号的信息”后，回复来自 `my-mcp-server.mjs` 中的数据库数据，而不是凭空生成。这让这个 demo 同时具备了代码证据和交互证据。

这个 demo 小，但它已经说明了 MCP 最关键的变化：AI 不再只是根据已有上下文生成答案，而是可以通过明确协议接入外部系统，并在受控边界内完成任务。

## 一、问题不是“工具不够多”，而是“工具太绑死”

README 里提出了一个很实在的问题：当前项目里的 tool 有什么局限？

第一，只能在这个项目里用，换到其他应用就不一定能复用。

第二，如果工具是 Node.js 写的，Java、Python、Rust 写的工具怎么办？

这两个问题指向同一个本质：工具如果和某个 LLM 应用强绑定，它就很难成为真正的系统能力。它更像一段项目内部代码，而不是一个可复用、可组合、可治理的能力单元。

MCP 要解决的正是这件事。工具应该独立于 LLM，Agent 通过协议调用工具，而不是把工具写死在某一个模型应用里。这样，本地工具可以通过 stdio 跨进程调用，远程工具可以通过 HTTP 类传输方式调用，不同语言实现的服务也可以统一接入。

所以，MCP 的关键词不是“插件”，而是“解耦”：

- LLM 和工具解耦
- 应用和工具解耦
- 编程语言和调用方式解耦
- 本地进程和远程服务解耦

解耦之后，Agent 才能从“单个应用里的智能功能”变成“可以调度系统能力的工作入口”。

## 二、这个项目已经跑通了 MCP 的最小闭环

从代码看，这个 demo 包含四个关键环节。

第一，MCP Server 定义自己的身份。

`src/my-mcp-server.mjs` 中创建了一个服务：

```js
const server = new McpServer({
    name: 'my-mcp-server',
    version: '1.0.0',
});
```

这一步看似简单，但它表达了一个重要边界：工具不是模型内部函数，而是一个独立 Server 暴露出来的能力。

第二，Server 暴露工具 `query_user`。

这个工具的功能很明确：输入用户 ID，返回数据库中的用户详情。当前 demo 使用的是内存假数据：

```js
const database = {
    users: {
        '001': { id: '001', name: '张三', email: 'zhangsan@example.com', role: 'admin' },
        '002': { id: '002', name: '李四', email: 'lisi@example.com', role: 'user' },
        '003': { id: '003', name: '王五', email: 'wangwu@example.com', role: 'user' },
    }
}
```

虽然这里是模拟数据库，但结构已经接近真实业务系统：Agent 不需要知道数据如何存储，只需要知道有一个可调用工具，输入 `userId` 就能得到结果。未来把内存对象替换成 MySQL、PostgreSQL、Redis 或远程 CRM，本质上不改变 Agent 的调用方式。

第三，Server 暴露资源 `docs://guide`。

项目里不仅有 Tool，还有 Resource：

```js
server.registerResource(
    '使用指南',
    'docs://guide',
    {
        description: 'MCP Server 使用说明指南',
        mimeType: 'text/plain',
    },
    async () => {
        return {
            contents: [
                {
                    uri: 'docs://guide',
                    mimeType: 'text/plain',
                    text: `
                    MCP Server 使用指南
功能：提供用户查询等工具。
使用：在 Cursor 等 MCP Client 中通过自然语言对话，Cursor 会自动调用相应工具。
                    `
                }
            ]
        }
    }
)
```

这说明 MCP 不只提供“动作”，也提供“上下文”。Tool 负责做事，Resource 负责让模型知道服务的背景、说明、文档或只读数据。

第四，Server 通过 stdio 连接。

```js
const transport = new StdioServerTransport();
await server.connect(transport);
```

这正好对应 README 里的判断：跨本地进程调用，核心就是通过标准输入输出流通信。Agent 作为父进程启动 MCP Server 子进程，两者不需要共享同一个运行时，也不需要写在同一个项目模块里。

## 三、Agent 侧的关键不是调用函数，而是管理一轮推理和工具反馈

`src/langchain-mcp-test.mjs` 展示了 Agent 如何消费 MCP Server。

它先创建 MCP Client：

```js
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    'my-mcp-server': {
      command: 'node',
      args: ['D:/workspace/sw_ai/ai/agent_in_action/mcp-demo/src/my-mcp-server.mjs'],
    }
  }
})
```

这里有一个重要信息：Client 不是 import 一个本地函数，而是用 `command + args` 启动一个独立进程。也就是说，Agent 连接的是一个服务，而不是依赖某个 JS 模块。

接着，Client 加载工具：

```js
const tools = await mcpClient.getTools();
const modelWithTools = model.bindTools(tools);
```

然后读取资源：

```js
const res = await mcpClient.listResources();
let resourceContent = '';
for (const [serverName, resources] of Object.entries(res)) {
  for (const resource of resources) {
    const content = await mcpClient.readResource(serverName, resource.uri);
    resourceContent += content[0].text;
  }
}
```

最后，把资源内容放进 `SystemMessage`，让模型在回答前先获得这段服务说明：

```js
const messages = [
  new SystemMessage(resourceContent),
  new HumanMessage(query),
];
```

这段实现很关键。它不是简单地“模型调用一个 API”，而是形成了一个完整循环：

1. 用户提出自然语言请求
2. 模型基于上下文判断是否需要工具
3. 如果产生 `tool_calls`，程序找到对应 MCP Tool
4. 调用工具并把结果包装成 `ToolMessage`
5. 再把工具结果交回模型生成最终答案
6. 任务结束后关闭 MCP Client，释放子进程资源

这就是 Agent 工程和普通接口调用的差异。普通接口调用通常是程序员预先决定调用哪个接口，而 Agent 工程是模型在上下文和工具描述的约束下，动态决定什么时候调用哪个工具。

## 四、Tool 和 Resource 的分工，决定了 MCP 的上限

这个 demo 里最值得注意的设计，不是 `query_user` 查到了张三，而是它同时使用了 Tool 和 Resource。

Tool 面向行动。比如 `query_user` 的职责是“输入用户 ID，查询并返回用户信息”。它有明确输入、明确输出，也有失败分支：如果用户 ID 不存在，就提示可用 ID 是 `001,002,003`。

Resource 面向上下文。比如 `docs://guide` 的职责是告诉 Client：这个 MCP Server 的功能是什么，应该怎样使用。它不直接执行动作，但能成为模型的背景知识。

这两者组合起来，Agent 才不只是“拿到一个函数”，而是“理解一个服务，并在合适时机调用它”。

这也解释了 README 中“resource 可以作为 SystemMessage Prompt 的一部分，成为 context”的思路。Resource 和 RAG 都能补充上下文，但侧重点不同：

- RAG 偏向从大规模文档中检索相关片段
- Resource 偏向由 MCP Server 明确暴露稳定、可访问、可管理的上下文

前者解决“资料太多，怎么找”的问题，后者解决“服务有什么，怎么让模型知道”的问题。

## 五、MCP 不是 fetch 的替代品，而是 Agent 接入系统的协议层

README 里有一句很重要的话：MCP 和 fetch 不同，不是简单的数据接口调用，而是扩展 context。

这句话需要更准确地理解。MCP Server 的内部当然可以调用数据库、HTTP API、文件系统或消息队列。也就是说，MCP 并不排斥 fetch。区别在于，fetch 是程序访问接口的方式，而 MCP 是 Agent 发现、理解和调用外部能力的协议。

用一句话概括：

fetch 解决“程序怎么拿数据”，MCP 解决“模型怎样在标准边界内使用外部能力”。

这就是为什么 MCP 要描述工具名称、工具说明、输入 schema、资源 URI、传输方式和返回内容。它不是只把数据拿回来，而是把能力包装成模型可以理解、客户端可以管理、系统可以治理的形式。

在这个项目中，`query_user` 的输入用 `zod` 描述：

```js
inputSchema: {
    userId: z.string().describe('用户ID，例如:001,002,003')
}
```

这一步非常重要。它让模型知道参数是什么，也让工具调用有基本的结构约束。到了生产系统，这种 schema 还可以继续扩展成权限校验、参数校验、审计记录和错误治理的入口。

## 六、真正落地时，要把 MCP 当成工程边界来设计

这个 demo 已经能说明 MCP 的思想，但如果进入真实业务，还需要补上几个关键设计。

第一，工具能力要窄。

`query_user` 是一个好例子，因为它只做一件事：按用户 ID 查询用户。生产系统中，应尽量避免暴露“执行任意 SQL”“读任意文件”“调用任意 URL”这种过宽能力。工具越窄，Agent 越容易正确使用，安全边界也越清楚。

第二，输入输出要结构化。

当前工具返回的是文本，便于演示。但如果要接入复杂工作流，最好返回 JSON 结构，例如：

```json
{
  "id": "001",
  "name": "张三",
  "email": "zhangsan@example.com",
  "role": "admin"
}
```

结构化结果更容易被后续工具消费，也更容易做日志、测试和权限控制。

第三，读操作和写操作要分层。

查询用户信息属于低风险读操作。如果未来加入“修改用户角色”“删除用户”“发送邮件”等写操作，就必须引入二次确认、权限校验、审计日志和回滚方案。Agent 能办事之后，最怕的不是不能调用工具，而是能调用但边界不清。

第四，Resource 要有版本意识。

`docs://guide` 当前是一段静态说明。生产环境中，资源可能对应业务规则、工具说明、字段解释或操作手册。一旦这些内容变化，Agent 的行为也可能变化。因此 Resource 不应只是文档文本，还应纳入版本管理和发布流程。

第五，进程生命周期要被认真处理。

`langchain-mcp-test.mjs` 最后调用了：

```js
await mcpClient.close();
```

这不是细节。MCP Server 作为子进程启动后，如果不关闭通信通道，脚本可能一直挂着，资源也无法释放。Agent 工程不是只看模型输出，还要管理进程、连接、超时、重试和异常。

## 七、这个 demo 给我的启发

MCP 最有启发性的地方，是它改变了我们理解 AI 应用的方式。

过去我们常问：模型能不能回答这个问题？

现在更应该问：系统有没有把这项能力以清晰、受控、可复用的方式暴露给 Agent？

如果能力没有暴露，模型再强也只能猜。如果能力暴露得太宽，Agent 又可能带来安全和治理风险。真正的工程价值在中间：把业务能力切成合适的 Tool，把稳定上下文整理成 Resource，再通过 MCP Client 接入 Agent。

这个项目里的用户查询案例很小，但它已经构成了一个完整范式：

```text
用户意图 -> 模型理解 -> MCP Client -> MCP Server -> Tool/Resource -> 工具结果 -> 模型回答
```

这条链路一旦成立，就不只适用于“查询 001 用户”。它可以扩展到订单查询、知识库问答、代码仓库分析、运维诊断、报表生成、客服辅助、企业内部系统操作。

真正重要的不是张三这条数据，而是张三这条数据没有被写进模型，也没有被模型幻想出来。它来自一个被 MCP Server 暴露出来的外部能力。

## 结语

MCP 的本质，是为 Agent 接入外部世界建立一层协议边界。

它让工具独立于 LLM，让资源成为上下文，让本地和远程能力都可以被统一管理。对于开发者来说，MCP 的意义不是多学一个 SDK，而是重新思考系统能力应该如何被 AI 调用。

未来的 AI 应用，竞争点不会只是“谁的模型更会说”，而是谁能把真实业务能力组织成清晰、稳定、安全、可组合的工具网络。这个 demo 的价值就在这里：它用一个最小用户查询场景，展示了 Agent 从对话走向行动的工程路径。

## 参考资料

- `readme.md`：项目对 MCP 协议、stdio/http、Tool/Resource、跨进程调用的学习笔记
- `src/my-mcp-server.mjs`：MCP Server 实现，包含 `query_user` Tool 和 `docs://guide` Resource
- `src/langchain-mcp-test.mjs`：LangChain 侧 MCP Client 调用流程，包含工具加载、资源读取、ToolMessage 回传和连接关闭
- `src/1.js`：`Object.entries` 遍历练习，和 Client 侧遍历多个 Server 资源的写法形成对应
- `package.json`：项目依赖，包括 `@modelcontextprotocol/sdk`、`@langchain/mcp-adapters`、`@langchain/openai`、`zod`
- `extracted-sdk/README.md`：MCP TypeScript SDK 对 Server、Transport、Tools、Resources、Prompts 的说明
- `extracted-mcp/README.md`：LangChain MCP Adapters 对 `MultiServerMCPClient`、stdio/HTTP 传输和多 Server 管理的说明
- 截图资料：TRAE 中 MCP Server 启用状态，以及 Agent 查询 001 用户信息的实际交互结果
