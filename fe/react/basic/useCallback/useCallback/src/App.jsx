import { 
  useState,
   memo } 
   from 'react';
function RegularChild({name}) {
  console.log('RegularChild 组件渲染');
  return (
    <>
    <h1>{name}</h1>
    </>
  );
}

function App() {
  const [count, setCount] = useState(0);
  console.log('APP 组件渲染');
  const [name, setName] = useState('少林队');

  return (
    <>
<button onClick={()=>setCount(count+1)}>点击计数{count}</button>
<button onClick={()=>setName('峨眉队')}>点击姓名</button>
<RegularChild name={name} />
<MemoChild name={name} />
    </>
  );
}

  const MemoChild = memo(({name})=>{
    console.log('MemoChild 组件渲染');
    return (
      <>
      <h1>{name}</h1>
      </>
    );
  });
export default App;
