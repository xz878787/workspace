import * as React from 'react'
import HelloComponent from './components/Hello';
import NameEdittComponent from './components/NameEditingComponent';
// 写js一样写ts
const App=()=>{
    const [name,setName]=React.useState<string>("defaultUserName");
    //编辑中的
    const [editingName,setEditingName]=
    React.useState("defaultUserName");
    
    const loaderUsername=() =>{
        setTimeout(()=>{
            setName("name from async call");
            setEditingName("name from async call");
        },2000)
    }
    //副作用
    React.useEffect(()=>{
      //组件挂载后
    //   组件第一要素是赶快显示出来， 让用户觉得快
    loaderUsername();
    },[])

    const setUserNameState=()=>{
        setName(editingName);
    }
    return (
        <>
        名字:{name}
        <HelloComponent  userName={name}/>
        <NameEdittComponent
        initialUserName={name}
        editingName={editingName}
        onNameChange={setUserNameState}
        onEditingNameUpdated={setEditingName}
        disabled={editingName==="" || editingName===name}
        />
        </>
    )
}

export default App