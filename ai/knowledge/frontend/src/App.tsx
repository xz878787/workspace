// 后台应用布局
// 侧边栏导航 + 顶部栏 + 主内容区的经典三栏布局
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// 路由守卫组件
function Guard({ children }) {
  // hooks 
  const user = useAuth();
  // replace 替换当前浏览器历史记录， 不新增一条历史
  // 规避返回按钮再次回到受保护路由，返回跳
  if (!user) return <Navigate to="/login" replace />

  return children
}

function App() {
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />}/>
      <Route
        path="/"
        element={
          <Guard>
            <AppLayout/>
          </Guard>
        }
      >
      </Route>
    </Routes>
  )
}

export default App
