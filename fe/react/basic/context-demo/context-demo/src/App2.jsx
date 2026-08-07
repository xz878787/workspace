import{
    useState
}from 'react';
import { ThemeContext } from './ThemeContext.jsx';
// function App() {
//   return (
//     <>
//       <Parent>
//         <Child>
//           <GrandChild >

//           </GrandChild >
//         </Child>
//       </Parent>
//     </>
//   );
// }
import Page from './components/Page.jsx';

function App() {
  const [theme,setTheme]=useState('light');
  return (
    <>
    {/* 上下文的提供者  容器 */}
    {/* 并不是需要全局， 任何地方作为容器使用 */}
    {/* 默认值 light,  可以通过 value 来改变 */}
    <ThemeContext.Provider value={theme}>
      <Page />
      <button onClick={()=>setTheme('dark')}>按键dark</button>
      <button onClick={()=>setTheme('light')}>按键light</button>
    </ThemeContext.Provider>
    </>
  );
}
export default App;
