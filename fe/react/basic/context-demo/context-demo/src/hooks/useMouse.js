import{
    useState,
    useEffect,
}from 'react';
export const useMouse=()=>{
  const [x,setX]=useState(null);
    const [y,setY]=useState(null);

    // 处理鼠标移动
    const handleMouseMove=(e)=>{
        setX(e.clientX);
        setY(e.clientY);
    };

    useEffect(()=>{
        document.addEventListener('mousemove',handleMouseMove);
        return ()=>{
            // 函数组件写在后， 不会主动回收的
            // 定时器、worker、事件 手动回收
            document.removeEventListener('mousemove',handleMouseMove);
        }
    },[])
    return {x,y};
}
