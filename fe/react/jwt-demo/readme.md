# jwt 登录鉴权
用的都是JWT Json Web Token
- HTTP 是无状态 Stateless ， 用户身份？ 你是谁？
- Header Authorization 
Bear Token   一串鉴权码 凭证 加密 
- /login admain 123456
{
    "id": 1,
    "username": "admin",
    "role": "admin",
    "password": "123456"
}
JSON 身份对象    => JWT  => token 颁发给登录者
每次带上token => authorization => decode => JSON 对象  
## zustand 
轻量级的状态管理框架 react 全家桶 react+ react-router-dom+zustand
- 父子传递 组件通信 状态共享
- createContext + useContext 跨层级共享 
- 登录与否， 用户信息 全局状态 、
全局共享， 跨路由 
zustand 统一管理  store 状态仓库
React App = UI Component + Store  

## mockjs 大前端 鉴权
- axios baseURL
- vite mockjs 插件
 /api/ 

 ## JSONWebToken
 sign ,vertify
 sign 用户json 对象 (身份信息，json 表现力)
 ccokie/secction 登录方案
 cookie 请求每次都会带上 sessionId
 sessionId -> 内存中 session 会话对象 不太适合分布式
 JWT 没有这个问题， 任何一台服务器签发的token 都可以再任何一台服务器签发的

 ## 拦截器
 axios 默默做了很多
 1.后端签发的 token 放在localStorage
 2. axios 配置里添加一个interceptors
   - request
每个axios 请求拦下来
config 请求配置对象
config.header['Authorization'] 
每次请求自动带上
return config
   - response
