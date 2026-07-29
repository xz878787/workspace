import * as React from 'react';

interface Props {
   //接口不是json ,  ; 隔开
   initialUserName:string;
   onNameUpdated:(newName:string)=> void;
}
const NameEditComponent: React.FC<Props> = (props) => {
// 表单事件 自己打理
//自有状态
const [editingName,setEditingName]=React.useState(
    props.initialUserName
)
const onChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    setEditingName(e.target.value);
}
const onNameSubmit=()=>{
    props.onNameUpdated(editingName);
}

return (
    <>
    <label >Update name:</label>
    <input value={editingName} onChange={onChange}/>
    <button onClick={onNameSubmit}>Update</button>
    </>
)
}

// interface Props {
//   username: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>)  => void;
// }
// const NameEditComponent:React.FC<Props> = (props)=>{
//   return (
//     <div>
//     <label >Update Name:</label>
//     <input value={props.username} onChange={props.onChange}/>

//     </div>
//   )
// }
export default NameEditComponent