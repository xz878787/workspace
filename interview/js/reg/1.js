let str='13800000090';
// 描述一个匹配的规则
//一个字符一个字符的匹配
//[]表示匹配的字符范围

let reg=/^1[3-9][0-9]{9}$/;
console.log(typeof {});
console.log(typeof reg);
console.log(
    Object.prototype.toString.call(reg)
)
console.log(reg.test(str));



















