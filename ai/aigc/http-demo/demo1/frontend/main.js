// let friends = [];

// function loadDate(){
// // console.log('loadDate');
// //endpoint 
//  const endpoint = 'http://localhost:3000/friends'
//  /// 异步变同步
//  const res= await fetch(endpoint)//发送请求 异步
//  const data= await res.json();
//  return data;
// // 等待响应返回
// //响应体是json 二进制字符串 转换为json对象
// // .then (res => res.json())
// // .then (data => {
// //    console.log(data);
// // })

// }
// function renderDate(friends){
// console.log('renderDate');
// }
// const oBody=document.querySelector('table tbody');
// if(friends.length>0){
//     oBody.innerHTML=friends.map(function(friend){
//         console.log(friend);
//         return `
//         <tr>
//             <td>${friend.name}</td>
//             <td>${friend.age}</td>
//             <td>${friend.id}</td>
//         </tr>
//         `
//     })
// }


// async function init(){
//     console.log('init start');
//    const friends= await loadData();
//    console.log(friends);
//     renderData(friends);
//     init();
//    // console.log('init end');
// }
let friends = [];

// 错误1修复：添加 async
async function loadDate() {
  const endpoint = 'http://localhost:3000/friends'
  const res = await fetch(endpoint)
  const data = await res.json();
  return data;
}

// 接收数组参数
function renderDate(arr) {
  console.log('renderDate', arr);
  const oBody = document.querySelector('table tbody');
  // 数据拿到后再渲染表格
  if (arr.length > 0) {
    oBody.innerHTML = arr.map(function(friend) {
      return `
        <tr>
            <td>${friend.name}</td>
            <td>${friend.age}</td>
            <td>${friend.id}</td>
        </tr>
        `
    }).join('') // map返回数组，必须join拼接成字符串
  }
}

async function init() {
  console.log('init start');
  // 拿到接口数据，赋值给全局变量
  friends = await loadDate();
  console.log(friends);
  // 统一函数名：renderDate
  renderDate(friends);
  // init(); ❌删掉，无限循环
}

// 页面初始化执行一次
init();