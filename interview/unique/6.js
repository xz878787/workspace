function unique(arr) {
   if(!Array.isArray(arr)){
    console.log('type error');
    return [];
   }
    return [...new Set(arr)];
}
console.log(unique([1,2,3,4,5,6,6,8,9]));