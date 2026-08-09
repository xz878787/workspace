import { useRef } from 'react';

//非受控组件 (通过 useRef 获取值)
const UncontrolledInput = () => {
  const inputRef = useRef(null);

  const handleClick = () => {
    alert('输入值：' + inputRef.current.value);
  };

  return (
    <div>
      <p>非受控组件（useRef）：</p>
      <input
        type="text"
        ref={inputRef}
        defaultValue="初始值"
      />
      <button onClick={handleClick}>输入获取值</button>
    </div>
  );
}
console.log('UncontrolledInput mounted');
export default UncontrolledInput;
