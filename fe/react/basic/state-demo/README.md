# useState
- 响应式数据状态
- hooks 函数式编程的带头大哥
- 参数? 初始值|函数
- 返回值  [state,setState] 

## Fragment 组件
- 它可以作为容器， 内部挂载子元素们(DOM树的功能) 
-  一次性的挂载到页面 #root ,fragment 元素就会功成身退。

## 异步

useState 的更新是异步且批处理的：调用 setCount 并不立即改变当前作用域的 count 值，旧值会在本次渲染中保持不变，新值将在下次渲染时生效。
组件里的状态比较多， x、y、z 坐标， 移动， 多个状态同时改
react 状态的更新是靠react 组件函数的重新运行来实现的
三次调用 count +3 (0 -> 3 -> 6 -> 9)  本轮处理 三次都是一样的， 合并，只执行最后一次。 目的都是性能优化。
如果非要 达到+ 多个的效果呢?  多次执行，每一次都拿到最新的状态值
传函数， 基于当前状态， 返回全新状态，不再是闭包引用

- useState( 初始值|函数)  用于因对不同的初始场景
函数就是复杂情况， 100个npc ? 10000个用户， 复杂的随机逻辑....
- 
//bad
const [users]= useState(heavyComputation());
<!-- //good 懒执行， lazy react 只在挂载时执行一次， -->
当数据状态改变时， 函数组件再次执行， 他会忽略
const [users]= useState(()=>heavyComputation());