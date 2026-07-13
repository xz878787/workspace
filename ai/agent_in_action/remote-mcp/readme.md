# 远程MCP

MCP 本质还是tool , 只不过还报了一层进程， 可以通过stdio 和http来访问

## 应用场景
高德地图 chrome DevTool  FileSystem 

西安大唐不夜城 (坐标点)附近的酒店 amap 
chrome DevTool 打开网页 npx
file System 写入本地文件 npx 

AI 工作流 
pnpm i dotenv @langchain/core @langchain/openai @langchain/mcp-adapters zod chalk @modelcontextprotocol/sdk
有了MCP 协议后， 有个巨大的好处。
任何人都可以开发基于这个协议的MCP Server, 然后可以直接复用。

- 高德MCP 可以做位置查询 、路线规划等
    https://developer.amap.com/
- ChromeDevTools MCP 控制浏览器， 打开关闭页面、点击元素、
截图留下证据 等
- File SystemMCP 读写本地文件、创建目录