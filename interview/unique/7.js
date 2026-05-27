function unique(arr) {
    if(!Array.isArray(arr)){
        console.log('type error');
        return [];
    }
  let res = [];
obj= new Map();//hashMap
for(let i=0;i<arr.length;i++){
    if(!obj.get(arr[i])){
        res.push(arr[i]);
        obj.set(arr[i],1);
    }
    else {
        obj.set(arr[i])++;
    }
}



}
