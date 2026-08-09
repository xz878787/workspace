import{
    useState
 } from 'react';
 //受控组件 (响应式状态控制input)
const ControlledInput = () => {
    const [value, setValue] = useState('');
  return (
    <div>
      <p>受控组件（useState）：</p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>当前值：{value}</p>
    </div>
  );
}
console.log('ControlledInput mounted');
export default ControlledInput;
