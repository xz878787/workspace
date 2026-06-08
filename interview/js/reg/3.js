// - 干掉 w 改成 W 大写
const str ='hello-world';
// ()分组  不匹配(),但是可以提取
// $1 表示提取的第一个分组
const reg=/-(\w)/;
console.log(str.match(reg));
const res =str.replace(reg,(_,c)=>{
    console.log(_,c,'/////');
    return c.toUpperCase();
})
console.log(res);