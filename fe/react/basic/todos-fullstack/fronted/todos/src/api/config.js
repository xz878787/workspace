//配置下axios
import axios from 'axios';
//实例化axios
//fetch 缺点是功能小
// app/ api/todos ->  :3000/todos
// 统一管理， fetch 升级为axios
const instance = axios.create({
  baseURL: '/api',// dev 前端模拟的请求地址 /api//todos
//   baseURL: 'http://localhost:3000'
timeout: 5000,
});
export default instance;