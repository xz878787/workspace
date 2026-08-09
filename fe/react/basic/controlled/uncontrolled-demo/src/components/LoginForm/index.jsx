// import { 
//     useState 
// } from 'react';
// import './index.css';
// function LoginForm() {
// const [form, setForm] = useState({
//     username: '',
//     password: '',
// });
// const [errors, setErrors] = useState({})
// const validate=(name,value)=>{
//     let msg="";
//     if(name==='username'){
//         if(!value){
//             msg="用户名为空";
//         }else if(value.length<3){
//             msg='用户名长度不能小于3'
//         }
//     }
//     if(name==='password'){
//         if(!value){
//             msg="密码不能为空";
//         }else if(value.length<6){
//             msg='密码长度不能小于6'
//         }
//     }
//     setErrors(prev=>({
//         ...prev,
//         [name]:msg
//     }))
// }

// const handleChange=e=>{
//     const {name,value}=e.target;
//     setForm({
//         ...form,
//         [name]:value
//     })
//     validate(name,value);
// }


// const isValid=form .username&&form.password&& 
// !errors.username&& !errors.password;

// const handleSubmit=e=>{
//     e.preventDefault();
//     if(!isValid)return ;
//     console.log(form,'-------------');
// }

// //   return (
// //     <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
// //       <h3>登录表单</h3>
// //       <form onSubmit={handleSubmit}>
// //         <div>
// //           <input
// //             name="username"
// //             type="text"
// //             value={form.username}
// //             onChange={handleChange}
// //             placeholder="用户名"
// //             style={{ marginRight: '10px', padding: '5px' }}
// //           />
// //         </div>
// //         <div style={{ marginTop: '10px' }}>
// //           <input
// //             name="password"
// //             type="password"
// //             value={form.password}
// //             onChange={handleChange}
// //             placeholder="密码"
// //             style={{ marginRight: '10px', padding: '5px' }}
// //           />
// //         </div>
// //         <div style={{ marginTop: '10px' }}>
// //           <button type="submit">登录</button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // }
// return (
//     <div className="login-wrapper">
//       <form>
//         <h2>登录</h2>
//         <div className="form-item">
//           <label>
//             用户名
//           </label>
//           <input type="text" name="username" 
//           value={form.username}
//           placeholder="请输入用户名"
//           onChange={handleChange}
//           />{error.username && <span className="error">{error.username}</span>}
//         </div>
//         <div className="form-item">
//           <label>
//             密码
//           </label>
//           <input type="text" name="password" 
//           value={form.password}
//           placeholder="请输入密码"
//           onChange={handleChange}
//           />{error.password && <span className="error">{error.password}</span>}
//         </div>
//         <button type="submit" onClick={handleSubmit} disabled={!isVaild}>提交</button>
//       </form>
//     </div>

//   )
// }

// export default LoginForm;


import { useState } from "react";
import "./index.css"

const LoginForm = () => {
  const [form,setForm] = useState({
    username:"",
    password:""
  })
  const [error,setError] = useState({})
  const validate=(name,value)=>{
    let msg = "";
    if(name==="username"){
      if(!value) {
        msg = "用户名为空"
      }else if(value.length<3){
        msg = "用户名长度不能小于3"
      }
    }
    if(name==="password"){ 
      if(!value) {
        msg = "密码为空"
      }else if(value.length<3){
        msg = "密码长度不能小于3"
      }
     }
     setError(prev=>({
      ...prev,
      [name]:msg
     }))
    
    }
  const handleChange=e =>{
      const {name,value} = e.target
      setForm({
        ...form,
        [name]:value
      })
      setError({
        ...error,
        [name]:validate(name,value)
      })
      validate(name,value)
     }
  const isVaild= form.username && form.password && 
  !error.username && !error.password
  const handleSubmit = e=>{
    e.preventDefault();
    if(!isVaild)  return
    console.log(form,"-----------------")
  }
  return (
    <div className="login-wrapper">
      <form>
        <h2>登录</h2>
        <div className="form-item">
          <label>
            用户名
          </label>
          <input type="text" name="username" 
          value={form.username}
          placeholder="请输入用户名"
          onChange={handleChange}
          />{error.username && <span className="error">{error.username}</span>}
        </div>
        <div className="form-item">
          <label>
            密码
          </label>
          <input type="text" name="password" 
          value={form.password}
          placeholder="请输入密码"
          onChange={handleChange}
          />{error.password && <span className="error">{error.password}</span>}
        </div>
        <button type="submit" onClick={handleSubmit} disabled={!isVaild}>提交</button>
      </form>
    </div>

  )
}

export default LoginForm;