import{
    Navigate,
    useLocation
} from 'react-router-dom';

const ProtectRoute=({children})=>{
    console.log(children,'-----');
    // 拦截请求 鉴权
    //html5 本地存储 域名的沙盒
    const location=useLocation();
    const isLogin=localStorage.getItem('isLogin')==='true'
    console.log(isLogin,'isLogin');
    if(!isLogin){
        // 未登录， 重定向到登录页
        //路由 ， 设置 state 状态对象
        //从哪里来?
        //location 对象
        return <Navigate to="/login" replace state={{from:location}} />
    }
  return (
    <>
    ProtectRoute:
     {children}
    </>
  );
}
export default ProtectRoute;
