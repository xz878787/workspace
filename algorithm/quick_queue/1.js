
//治
function partition(nums,left,right){
 let i = left,j = right;//左右指针
 //检查一遍数据
 while(i<j){
    //第一项作为基准值
    //不开销新的空间 原地排序
while(i<j&& nums[j]>=nums[left]){
    //右侧比基准值大的， 放到右边的数组 
    j--;//退出的情况是找到了第一个比基准值小的元素
}
while(i<j&& nums[i]<=nums[left]){
    i++;//退出的情况是找到了第一个比基准值大的元素
}
//元素交换
[nums[i],nums[j] ]= [nums[j],nums[i]];
 }
[nums[left],nums[i] ]= [nums[i],nums[left]];
 return i;// 返回基准值的位置， 作为分界线的索引
 }

 

function quickSort(nums,left,right){
    if(left>=right){
        return;
    }
    //privot 基准值在的位置
let pivot = partition(nums,left,right);
quickSort(nums,left,pivot-1);
quickSort(nums,pivot+1,right);
}

const arr=[4, 1, 5, 2];
quickSort(arr,0,arr.length-1);
console.log(arr);