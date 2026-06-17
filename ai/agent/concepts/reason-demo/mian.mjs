import client from './client.mjs';

const main= async()=>{
    const res=await client.chat.completions.create({
        model: "deepseek-v4-flash",
        reasoning_effort:'high',//深度推理模式
        messages:[
            {role:'system', content:'你是一个足球领域的专家，请尽量帮我回答与足球相关的问题'},
            {role:'user', content:'C罗是哪个国家的足球运动员?'},
            {role:'assistant', content:'C罗是葡萄牙的足球运动员'},
            {role:'user', content:'内马尔呢?'},
            // {role:'assistant', content:'内马尔是巴西的足球运动员'},
        ],
    });
    console.log('思考过程:');
        console.log(res.choices[0].message.reasoning_content); 
        console.log('\n最终答案:');
        console.log(res.choices[0].message.content);
}
main();