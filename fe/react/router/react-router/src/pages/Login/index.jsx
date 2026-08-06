import{
    //代码里重定向
    useNavigate,
    useLocation,

} from 'react-router-dom';

const Login = () => {
  const navigate=useNavigate();
  const location=useLocation();
//   /login  from 对象为空
//   /post/new 从这里来  -> login  from对象
//可选链操作符 es11
  const from = location.state?.from?.pathname || '/';
  console.log(from,'from');
  function handleSubmit(e){
    e.preventDefault();// 阻止默认提交
    //原生的表单数据对象  
    const formData= new FormData(e.currentTarget);
    const username= formData.get("username");
    const password=formData.get("password");
    if(!username || !password){
      alert("请输入用户名和密码");
      return;
    }
    if(username==="admin" && password==="123456"){
     localStorage.setItem('isLogin','true');
    //  浏览器前进，后退导航
    //  登录成功后， 如果还能返回登录页面， 用户就会蒙，
    //  把用户当小白， replace 跳转到新页面的同时，
    //  将新页面的历史记录替换掉/login的访问记录
     navigate(from,{replace:true});
    }else{
      alert("用户名或密码错误");
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <h1>登录</h1>
      <input
      name="username"
      placeholder="请输入用户名"
      required
      />
      <input
      name="password"
      placeholder="请输入密码"
      //html5 表单增强特性 type="range"
      type="password"
      required
      />
      <button type="submit">登录</button>
      <p>这是登录页面</p>
    </form>
  );
};
export default Login;
