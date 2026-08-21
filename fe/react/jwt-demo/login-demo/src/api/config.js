import axios from 'axios';
const instance = axios.create({
  baseURL: '/api',
  timeout: 5000
})
//拦截每个请求 request, 使用一个配置
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  // 请求配置对象
  return config;
})

export default instance