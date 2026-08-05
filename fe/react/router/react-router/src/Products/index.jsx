import {
    Outlet// 二级路由出口
} from 'react-router-dom';

const Products=()=> {
  return (
    <>
      <h2>Products 产品列表</h2>
      <p>这是产品列表内容</p>
      <Outlet />
    </>
  );
}

export default Products;
