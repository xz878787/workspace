import{
  useRef,
  useState,
  useEffect,
} from 'react';
const App=()=>{
  // console.log('main thread')
  // let worker=new Worker();
  // 为组件的渲染 挂载让路
  const workerRef=useRef(null);//可持久化的可变对象
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    // 开启一个worker 线程  开销比较大的
    // ref 引用了worker 线程。 
    workerRef.current=new Worker(
    new URL("./worker.js",import.meta.url))
// 监听worker 线程， 有没有消息到达
workerRef.current.onmessage=(e)=>{
    console.log(e);
    const{ result }=e.data;
    setResult(result);
    setLoading(false);
}
return ()=>{
    workerRef.current.terminate();
    workerRef.current=null;
  }
  },[])
//主线程 单线程 web worker 
// 离开主线程?  开辟新的线程
  // for(let i=0;i<100000;i++){
  //   console.log(i);
  // }
  // console.timeEnd('主线程')
  //阻塞页面
  const startHeavyCalc=()=>{
    setLoading(true);
    //消息机制
    //gei1worker 现成发送一条工作指令，  带上参数
    workerRef.current.postMessage({
      num:88 
    })
  }
  return (
    <>
  <div style={{padding:"30px"}}>
    <h2>useRef +WebWorker 耗时运算</h2>
    <p>开始 web worker 线程 执行5亿次循环， 结束后通知主线程</p>
    <button onClick={startHeavyCalc}
    disabled={loading} 
    >{loading ? "正在后台计算...":"启动繁重计算任务"}</button>
    {result && <h3>计算结果：{result}</h3>}
  </div>
    </>
  )
}
export default App;
