// //主程序文件
// // 多个默认的输出a,b ...{对象 key : value}
// // 解构语法
// import client ,{a,b} from './client.mjs';
// console.log(client);
// let{name11,age} = {"name11":"詹姆斯","age":20}
// console.log(name11,age);
// let obj={"name":"姚明","city":"北京"}
// // let name = obj.name;
// // let city = obj.city;
// //es6 让js 大型项目企业级开发语言
// // 解构赋值 从对象中提取属性值 成为变量 ，而且性能好 
// let{ name,city} = obj;
// // console.log(name,city);
// // name obj.name;性能差异
// console.log(name);
// console.log(city);//解构
// //数组的解构， 按顺序解构， rest 余下的全部解构
// let [coach,...players]=['教练','球员1','球员2','球员3']
// console.log(coach,players);
// let [hrcoach,...hrplayers]=['hr教练','hr球员1','hr球员2','hr球员3']
// let allPlayers=[...players,...hrplayers]
// console.log(hrcoach,hrplayers,allPlayers);
// 入口文件 简洁
import{getCompletion} from './completion.mjs';

async function main(){
//AI全栈
//企业里llm 接入nlp 能力
//情感推断与信息提取

const lamp_review_zh= '我需要一盏漂亮的卧室灯，这款灯具有额外的储物功能，价格也不算太高。\
  我很快就收到了它。在运输过程中，我们的灯绳断了，但是公司很乐意寄送了一个新的。\
  几天后就收到了。这款灯很容易组装。我发现少了一个零件，于是联系了他们的客服，他们很快就给我寄来了缺失的零件！\
  在我看来，Lumina 是一家非常关心顾客和产品的优秀公司！';
  //写一个Prompt 来分类这个评论的情感。 
//   const prompt= `以下用三个反引号 分隔的产品评论的情感是什么？
//                  评论文本:\`\`\`${lamp_review_zh}\`\`\`
//                  `
 //few shot

// const prompt= `识别以下用三个反引号 分隔的产品评论的作者表达的情感。
// 包含不超过5个项目。
// 将答案格式转化为逗号分隔的中文单词列表。
// 评论文本:\`\`\`${lamp_review_zh}\`\`\`
//                  `

// const prompt= `识别以下用三个反引号 分隔的产品评论是否表达了愤怒？
// 给出是或否的答案。
// 评论文本:\`\`\`${lamp_review_zh}\`\`\`
//                   `
// const prompt= `从评论文本中识别以下项目: 
// - 评论者购买的商品
// - 制造该商品的公司

// 评论文本用三个反引号 分隔。将你的响应格式以"物品(product)"和
// "品牌(brand)"为键的JSON对象。
// 如果信息不存在，请使用**未知** 作为值。
//  评论文本:\`\`\`${lamp_review_zh}\`\`\`
//                   `

// const prompt= `
// 从评论文本中识别以下项目: 
// - 情绪(正面或负面) 
// - 是否表达了愤怒？(是或否)
// - 评论者购买的商品
// - 制造该物品的公司

// 评论用三个反引号 分隔
//  将您的响应格式化为JSON对象，以“sentiment”、“anger”、“product”、“brand”为键。
// 如果信息不存在，请使用**未知** 作为值。
// 让你的回应尽可能简短。
// 将anger 值格式化为布尔值
// 评论文本:\`\`\`${lamp_review_zh}\`\`\`
//                    `
                   
const story_zh = `
  在政府最近进行的一项调查中，要求公共部门的员工对他们所在部门的满意度进行评分。
调查结果显示，NASA 是最受欢迎的部门，满意度为 95％。

一位 NASA 员工 John Smith 对这一发现发表了评论，他表示：
“我对 NASA 排名第一并不感到惊讶。这是一个与了不起的人们和令人难以置信的机会共事的好地方。我为成为这样一个创新组织的一员感到自豪。”

NASA 的管理团队也对这一结果表示欢迎，主管 Tom Johnson 表示：
“我们很高兴听到我们的员工对 NASA 的工作感到满意。
我们拥有一支才华横溢、忠诚敬业的团队，他们为实现我们的目标不懈努力，看到他们的辛勤工作得到回报是太棒了。”

调查还显示，社会保障管理局的满意度最低，只有 45％的员工表示他们对工作满意。
政府承诺解决调查中员工提出的问题，并努力提高所有部门的工作满意度。
  `
  const prompt=`
  确定以下给定文本中讨论的五个主题。
  每个主题用1-2个单词概括。
  输出时间用逗号分隔。
  给定文本:${story_zh}
  `
const response = await getCompletion(prompt);
console.log(response);
}
main();