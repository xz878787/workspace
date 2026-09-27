import "dotenv/config";
// 自动地根据.env langsmith 配置 去trace 
// langchain, langgraph, langsmith 打通的
import {
  Annotation,
  END, 
  START,
  StateGraph
} from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
  text: Annotation({
    reducer: (_prev, next) => next,
    default: () => "",
  })
});

const stepOk = (state) => ({ text: `${state.text}[ok]`}); // 正常执行
// 节点函数
// 不能正确的完成任务， 没有返回值 
const stepThrow = () => {
  throw new Error("DemoError:节点内故意跑错：(trigger-error.mjs)")
}

const graph = new StateGraph(StateAnnotation)
  .addNode("step_ok", stepOk)
  .addNode("step_throw", stepThrow)
  .addEdge(START, "step_ok")
  .addEdge("step_ok", "step_throw")
  .addEdge("step_throw", END)