import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {
  // 引入全局配置提供器
  // 用于配置antd 组件库的全局样式
  // 颜色、字体、间距、语言包 国际化
  ConfigProvider,
  // 引入antd 应用组件
  // 用于包裹App 组件， 提供全局应用上下文
  // message modal 
  App as AntdApp
} from 'antd'
// 国际化
import zhCN from 'antd/es/locale/zh_CN'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      // 主题配置
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
      }
    }}
  >
    <AntdApp>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>,
)
