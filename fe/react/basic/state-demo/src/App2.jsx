import{ 
  useState
 }from 'react';

function App() {

// 解构赋值：[当前状态, 更新状态的函数] = useState(初始值)
  const [count, setCount] = useState(0);
  const addCount = () => {
    // setCount(count + 3);// 修改状态  异步
    //   console.log(count);//同步0
    // setCount(count + 3);
    // setCount(count + 3);
    setCount(prevCount=>prevCount+3);
    console.log(count);//同步0
    setCount(prevCount=>prevCount+3);
    setCount(prevCount=>prevCount+3);
  }
  return (
    
    <>
      <p>当前计数：{count}</p>
      <button onClick={(addCount)}>+3</button>
    </>
  );
}
export default App;