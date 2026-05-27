/**
 * @func unique 数组去重
 * @param {Array} arr - 输入数组
 * @returns {Array} - 去重后的数组
 * @author xz
 * @date 2026-05-27
 */

function unique(arr){
  // 参数校验 不是数组，返回空数组
  if(!Array.isArray(arr)){
    console.log('type error')
    return [];
  }
  //双循环去重法
  let res = [];
  for(let i = 0; i < arr.length; i++){
    let flag = true;
    for(let j = 0; j < res.length; j++){
      if(res[i] === arr[j]){
        flag = false;
        break;
      }
    }
    if(flag){
      res.push(arr[i]);
    }
  }
  return res;

}
console.log(unique([1,2,3,4,5,5,6]));