const flatList = [
     // 1, 2, 3, [4, [5, 6`]]
     { id: 1, name: '一级菜单A', parentId: 0 }, //parentId
     { id: 2, name: '一级菜单B', parentId: 0 },
     { id: 3, name: '二级A-1', parentId: 1 },
     { id: 4, name: '三级A-1-1', parentId: 3 },
     { id: 5, name: '二级B-1', parentId: 2 }
 ];
 
 function listToTree(list) {
     // reduce initial_val 
     const nodeMap = list.reduce((map, item) => {
         map[item.id] = { ...item,  children: [] }
         return map;
     }, {});
 
     return list.reduce((tree, item) => {
         const cur = nodeMap[item.id];
         const parent = nodeMap[item.parentId];
         if (parent) {
             parent.children.push(cur);
         } else {
             tree.push(cur);
         }
         return tree;
     }, []);
 }

 const treeResult = listToTree(flatList);
console.log(JSON.stringify(treeResult, null, 2));