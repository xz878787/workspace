import { useMouse } from './hooks/useMouse';
function App(){
    const {x,y}=useMouse();


    return (
        <>
            <div style={{height:'100vh',display:'flex',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <h2>鼠标坐标：X: {x}, Y: {y}</h2>
                {/* {x&&y?`鼠标坐标：X: ${x}, Y: ${y}`:''} */}
            </div>
        </>
    )
}
export default App;
