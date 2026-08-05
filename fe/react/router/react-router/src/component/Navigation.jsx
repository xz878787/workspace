// a 点击后跳转， 二次处理
// 不直接用a， react-router-dom 提供了靠谱的link组件、
// 适合SPA 
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/user/123">小家</Link></li>
        <li><Link to="/products/123">产品详情</Link></li>
        <li><Link to="/products/new">新产品</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation