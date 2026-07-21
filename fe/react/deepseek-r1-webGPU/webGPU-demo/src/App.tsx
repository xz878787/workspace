// 现代前端开发框架
// .vue->tsx 组件化 typescript+ jsx 
// 响应式
// 数据绑定
// 函数封装特性 组件的html,css ,js 封成一个组件 
import {
  useState,// react 函数式思想 hooks , 以use 开头
  useEffect,// 生命周期钩子函数  组件挂载时执行
} from 'react'

function App() {
  //use 用，status 状态 hooks 函数
  // js 脚本 数据逻辑交互 
  //count 数据状态
  //修改count setCount
  // 数据状态驱动界面状态， 设计
  // 变/常量 -> 数据  (数据绑定 data binding & data driving)
  // 不需要dom 编程 ->数据状态 (响应式，修改状态，界面会跟着变)
  //数据有不同状态， 界面不同的状态 川剧变脸
  //null 初始值，loading 加载中  ready llm准备好了 
  const [status, setStatus] = useState(null);//响应式数据状态 ref
  // 错误对象数据状态
  const [error, setError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('出错了');
  const [progress, setProgressItem] = useState([{
    file: 'model.onnx',
    progress: 0,
    total: 34353543453
  }])
  // 浏览器 导航栏 是否支持 WebGPU
  // 现代浏览器的重要特性
  // ！ 表示取反 navigator.gpu不支持的时候 undefined 
  // ！！再取反，一定可以转为 true| false
  // 双重否定等于肯定
  const IS_WEBGPU_AVAILABLE = !!(navigator as any).gpu;

  // 组件生命周期 ， 副作用：
  //组件挂载后， 附带做什么


  useEffect(() => {
    console.log('组件已经挂载完成')
    setStatus('ready');
    // setTimeout(()=>{
    // setStatus('loading');

    // },2000)

  }, [])

  console.log(`组件函数执行`);
  // 返回 html jsx react 的UI 表现格式

  return (
    // flex-direction 主轴 100vh margin x 水平居中对齐
    // 原子类， 组合一下 flex-start  flex-end 
    IS_WEBGPU_AVAILABLE ? (<div className="flex flex-col h-screen mx-auto items-center justify-end text-gray-800 items-center">
      <div className="h-full overflow-auto flex justify-center items-center flex-col relativ">
        {/* 1rem=4  1单位=4px  
  []代表 指定样式大小
  */}
        <div className="flex flex-col items-center mb-1 max-w-[400px] text-center">
          {/* 蒸馏的是Qwen模型 */}
          <h1 className="text-4xl font-bold mb-1">Deepseek R1 WebGPU Demo</h1>
          <h1 className="text-2xl font-bold mb-1">Deepseek R1 WebGPU模型</h1>
          <h2 className="font-semibold">
            A next generation reasoning model that runs locally in
            your browser with WebGPU acceleration.
          </h2>
        </div>
        <div className="flex flex-col items-center px-4">
          <p className="mx-w-[510px]">
            <a
              href="https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline"
            >
              {/* DeepSeek-R1 的 15 亿参数量蒸馏版，用 Qwen 架构，适合本地轻量推理。
                蒸馏Qwen  Reasoning 推理模型
                HuggingFace 抱抱脸  全球最大的开源模型社区
              */}
              DeepSeek-R1-Distill-Qwen-1.5B
            </a>
            , a 1.5B parameter reasoning LLM optimized for in-browser
            inference. Everything runs entirely in your browser with
            {
              // transformers 是huggingface 推出的js库， 用于加载和推理模型
            }
            <a
              href="https://huggingface.co/docs/transformers.js"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              🤗&nbsp;Transformers.js
            </a>{" "}
            {/* Open Neural Network Exchange */}
            and ONNX Runtime Web, meaning no data is sent to a server. Once
            loaded, it can even be used offline. The source code for the demo
            is available on{" "}

          </p>
          {
            // 报错界面状态，响应式
            error && (
              <div className="text-red-500 text-center mb-2">
                <p className="mb-1">
                  Unable to load the model due to the following error:
                </p>
                <p className="text-sm">
                  {error.message}
                </p>
              </div>
            )
          }
        </div>
      </div>
    </div>) : (
      <div>您的浏览器还不支持WebGPU</div>
    )
  )
}

export default App