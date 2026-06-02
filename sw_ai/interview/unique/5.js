function unique(arr) {
    const res=[];
    for(let i=0;i<arr.length;i++){
        if(!obj[arr[i]]){
            res.push(arr[i]);
            obj[arr[i]]=1;
        }
        else {
            obj[arr[i]]++;
        }
    }
    return res;
}
