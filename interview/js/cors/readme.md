# 跨域 

- nginx 反向代理 
  - 前端项目  index.html nginx 
  - 发出的请求 /api 
  - :3001/ 
- vite + mockjs  dev 
- websocket 
  后端 sse  server sent event
  服务器**单向**流式输出 

  
- http 之外的协议
  **单向**传输 
  用户发起请求， 服务器反馈 ，断开， 一般服务器是不可以主动向用户发送数据的 
  server 伺服状态 等

  **sse 流式**， 服务器可以不断向浏览器推送数据  单向 
  响应头 
  Content-Type: text/event-stream;
  Cache-control: no-cache;
  Connection: keep-alive;

QQ Wechat Socket 协议， **双工**通信
不再是http 那种 只有浏览器发送数据， 服务器也可以。
在线状态 

Socket协议 实时通信， 聊天， 直播 
Client端
当它来到web端, WebSocket 协议
抖音、腾讯、哔哩哔哩、AI   弹幕 

两边都可以发送数据， 平等
- websocket 协议 
    qq, wechat 
    实时聊天  

- ws 库
  websocket 协议 实现 