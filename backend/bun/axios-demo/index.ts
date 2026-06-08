import axios from "axios";
import denv from "dotenv";
denv.config();

async function chat() {
// llm 可能会出错，异常
// timeout network ,llm 忙 apiKey  
try{
    // GET 请求有上限制
    // apiKey GET 不安全
    //图片 上传  post 请求体
    //请求行 url，method，http version 
    //请求头 Authorization
    //请求体 body
    // fetch http 请求api
    //axios http 请求的框架，封装了fetch请求的复杂性
    const res = await axios.post(`${process.env.DEEPSEEK_API_URL}`,{
       model:"deepseek-v4-flash",
       messages:[{
            role:"user",
            content:"你好"
        }]
    },{
        headers:{
            'Content-Type':"application/json",
            'Authorization':`Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
    })
    //axios默认会在响应前面带上data
    console.log(res.data.choices[0].message.content);
}catch(err:any){
    console.log(err.message);
}

}
chat();
