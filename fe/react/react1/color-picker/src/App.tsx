import{useState} from 'react';
import ColorBrowser from './components/ColorBrowser';
import ColorPicker from './components/ColorPicker';
import {type Color} from './model/color';
import MemberTable from './components/MemberTable';

function App(){
  // ts 适合大型项目开发， 代码量大
  const [color,setColor]=useState<Color>({
    red: 20,
    green: 40,
    blue: 10,
  })
  return (
    <>
      <ColorBrowser color={color} />
      <ColorPicker color={color} onColorUpdated={setColor} />
      <MemberTable />
    </>
  )
}
export default App;