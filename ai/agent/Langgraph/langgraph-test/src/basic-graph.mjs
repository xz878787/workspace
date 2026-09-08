import {
  Annotation, // 注释 工作流的状态值的描述 数据 state
  END, // 结束节点
  START,  // 开始节点
  StateGraph // 状态图 流程编排器 节点的组织
} from '@langchain/langgraph';
// Annotation 申明一个字段
// 数据部分
const StateAnnotation  = Annotation.Root({
  text: Annotation({ // 只有text 字段
    // _prev 来到当前节点之前的状态， next 当前节点得到的状态
    // reducer 怎么处理状态的改变
    reducer: (_prev, next) => next, // js 数组reduce 消消乐 text状态如何变
    default: () => "", //默认值
  })
})
// 定义节点
// 函数就是节点 
// 返回值 是下一个节点的状态
// reducer 处理状态的改变
const step1 = (state) => ({ text: `${state.text} -> step1`});
const step2 = (state) => ({ text: `${state.text} -> step2`});
// 实例化图工作流编排器
const graph = new StateGraph(StateAnnotation)
  // 申明所有节点 
  .addNode("step1", step1)
  .addNode("step2", step2)
  .addEdge(START, "step1")
  .addEdge("step1", "step2")
  .addEdge("step2", END)
  .compile() // 编译工作流 执行

// 可视化的图
// mermaid 文本画图工具， 简单的markdown, 自动生成流程图、
// 可视化整个节点流转关系。 
const drawable = await graph.getGraphAsync();
const mermaid = drawable.drawMermaid({ withStyles: true });
console.log(mermaid);