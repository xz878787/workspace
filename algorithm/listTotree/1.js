//扁平列表数据
// 扁平 数据的是一维的， 每项不再是数组
// 管理后台 树状结构
// 地址三连弹、多级菜单等 常见复杂功能
// parentId 是树状的关键
// mysql 数据存储表结构是一致的
// select * from 取出来 
// 列表转树状结构
// 先拿到第一层， 选中了后， 显示相应的第二层 ...
const flastList = [
    // 1, 2, 3,[4,[5,6]]
    {id :1,name:'一级菜单A', parentId:0},//parentId 0 表示一级菜单
    {id :2,name:'一级菜单B', parentId:0},
    {id :4,name:'二级A-1', parentId:1},//parentId 1 表示一级菜单1
    {id :5,name:'三级菜单A-1-1', parentId:3},
    {id :6,name:'二级B-1', parentId:2},
]
function listTotree(list) {
    const map= new Map();//es6 新增的 数据结构
    const tree= [];
    list.forEach(item => {
        map.set(item.id, {
            ...item,//展开
            children: [],//添加一个空数组
        })
    });
list.forEach(item=>{
    const current= map.get(item.id);//当前项
    const parent= map.get(item.parentId);//当前项的父项
    if(parent){
        parent.children.push(current);//组成了树
    }else{
        tree.push(current);
    }
});
return tree;
}

console.log(listTotree(flastList));
console.log(JSON.stringify(listTotree(flastList),null,2));
