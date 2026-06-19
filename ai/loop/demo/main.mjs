import {OpenAI }from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client= new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});
// 死循环，(最大尝试次数)，超预算(maxToken) ， sameStop 
const limit={
    maxRound:5,
    maxToken:2000,
    sameStop:2,
}

const tack={
    desc:"小红书美妆文案",//目标
    rules:["带标题数字","正文<300字","大爆款","结尾有行动号召"]
}

let round=0,totalToken=0,lastText="",sameCount=0;

function needStop(){
    return round>=limit.maxRound ||
    totalToken>=limit.maxToken ||
    sameCount>=limit.sameStop;
}

async function check(text){
    const res =await client.chat.completions.create({
        model: "deepseek-v4-flash",
        messages:[
            {
                role:"user",
                content: `校验文案：${text}
                规则：  ${tack.rules.join("、")}，
                仅输出JSON {pass: 布尔，fail: 数组}
                `
            }
        ]
    })
    return JSON.parse(res.choices[0].message.content.trim());
}

async function runLoop(){
console.log('AI Loop 开始');
async function gen(){
    const res = await client.chat.completions.create({
        model: "deepseek-v4-flash",
        messages: [
            {role: "user", 
             content: `假如你是一位资深小红书资深美妆博主，
             写一篇${tack.desc},严格遵守:
             ${tack.rules.join("、")},只输出文案
             `
       }]
      
    });
    console.log(res.usage.total_tokens,
        res.choices[0].message.content);
    return {
        text: res.choices[0].message.content.trim(),
        token: res.usage.total_tokens,
    }
}
while(!needStop()){//Loop
    round++;
    console.log(`第${round}轮`);
    // 干活 返回promise 返回一个对象，
    // 可以解构text,token
    const {text,token}=await gen()
    totalToken+=token;
    sameCount= text===lastText?sameCount+1:0;
    lastText=text;


    const {pass,fail}= await check(text);
    if(pass){
        console.log(`全部规则通过，循环结束`);
        console.log(`最终的文案：${text}`);
        return
    }
    console.log(`不满足规则：${fail}`);
}
console.log(`\n触发刹车强制停止，最后一次内容：${lastText}`)
}
runLoop();