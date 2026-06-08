//url +method +http 版本号 请求行 
const endpoint=
'https://api.deepseek.com/chat/completions';
//headers 请求头
const headers={
  //api key 通过 带上
    'Authorization':`Bearer sk-xxxxxxxxxxxxx`,
    'Content-Type':'application/json'
}
//请求体
const payload={

  //便宜点
  model: 'deepseek-v4-flash',
  messages:[
    {role:'system',content:'You are a helpful assistant'},
    {role:'user',content:'你好小志，Deepseek'}
  ]
}

try{
const response=await fetch(endpoint,{
  method:'POST',
  headers,
  // http请求里面 传输的不可以是对象
  //只能传输字符串
  body:JSON.stringify(payload)
})
const data=await response.json()
console.log(data)
document.getElementById('replay').innerHTML=data.choices[0].message.content;
}catch(err){

}