import{
  lazy,
  Suspense
}from 'react';
import{
  //location.hash
  HashRouter as Router,//前端路由 #/ hashchange
  Routes,//路由配置数组 都是组件
  Route , //
  Navigate, // 重定向组件
}from 'react-router-dom';
import Navigation from './component/Navigation';
//SPA, 动态页面切换多个页面
// 下载， 执行， 影响首页的加载速度 
// import Home from './pages/Home';
// import About from './pages/About';
// import User from './pages/User';
//import 函数
const Home=lazy(()=>import('./pages/Home'));
const About=lazy(()=>import('./pages/About'));
const User=lazy(()=>import('./pages/User'));
const NotFound=lazy(()=>import('./pages/NotFound'));
const Products=lazy(()=>import('./Products'));
const ProductDetail=lazy(()=>import('./Products/ProductDetail'));
const NewProduct=lazy(()=>import('./Products/New'));

const App=()=>{
  return (
    <>
    {/* 前端路由接管一切 */}
    <Router>
      <Suspense fallback={<div>等等我呗...</div>}>
      <Navigation />
      <div id="container">
        {/* 动态页面切换部分  即使配置，优势出现的的地方 */}
        <Routes>
          {/* 有且只有一个Route 显示 当前location.hash 对应页面级别组件 */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/user/:id" element={<User />} />

          {/* 多级路由 */}
          <Route path="/products" element={<Products />}>
            {/* 二级路由 */}
            <Route path=":productId" element={<ProductDetail />} />
            <Route path="new" element={<NewProduct />} />
          </Route>

          {/* 重定向：旧路径跳转到新路径 */}
          <Route path="/old-path" element={
            <Navigate replace to="/products/new" />
          } />

          {/* * 贪婪匹配所有， 最后404 兜底 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      </Suspense>
    </Router>
    </>
  )
}
export default App
