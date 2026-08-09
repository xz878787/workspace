import {
    useState
} from 'react';

function RegisterForm() {
    // 非受控两次useRef
    // vue ref 简单数据类型 /reactive 对象  两种响应式API
    const [form,setForm]=useState({
        username:"",
        password:""
    })
    const handleChange=(e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit=(e)=>{
        e.preventDefault();
        if(!form.username||!form.password){
            alert('请填写完整信息');
            return;
        }
        console.log('提交：',form);
        alert('注册成功！用户名：'+form.username);
    }
    return (
        <form onSubmit={handleSubmit} style={{marginTop:'20px',padding:'15px',border:'1px solid #ccc',borderRadius:'8px'}}>
         <h3>注册表单</h3>
         <div>
             <input
             name="username"
             type="text"
             value={form.username}
             onChange={handleChange}
             placeholder="请输入用户名"
             style={{marginRight:'10px',padding:'5px'}}
             />
         </div>
         <div style={{marginTop:'10px'}}>
             <input
             name="password"
             type="password"
             value={form.password}
             onChange={handleChange}
             placeholder="请输入密码"
             style={{marginRight:'10px',padding:'5px'}}
             />
         </div>
         <div style={{marginTop:'10px'}}>
             <button type="submit">提交</button>
         </div>
        </form>
    )
}
export default RegisterForm;
