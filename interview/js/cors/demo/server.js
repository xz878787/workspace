// commonjs 老的, esm  新的 
// module 
// html5 新增的功能
const WebSocket = require('ws');
const http = require('http'); // node 内置的http 模块

// 先要把http server 启动   web
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end('WebScoket Server Running!');
});

// 基于http server 再搭建socket 协议 
// WebSocket
const wss = new WebSocket.Server({ server, path: '/ws'});
// 监听事件  有人链接
wss.on("connection", (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Hello, client! ${message}`);
  })
})

server.listen(8080, () => {
  console.log(`listening on http://localhost:8080`);
})