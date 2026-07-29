import * as React from 'react';
//自定义类型和接口
interface Props{
 
    editingName:string;
    onNameUpdated:()=>void;
    onEditingNameUpdared:(newEditingName:string)=>void;
    disabled:boolean;
}
const NameEditComponent:react.FC<Props>=(props)=>{
  const{
    initialUserName,
    editingName,
    onNameUpdated,
    onEditingNameUpdared,
    disabled,
  }=props;
  const onChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    onEditingNameUpdared(e.target.value);
  }

  const onNameSubmit=()=>{
    onNameUpdated();
  }
  return (
    <>
    <label>Update name:</label>
    <input 
    value={editingName}
    onChange={onChange}
    />
    <button 
    disabled={disabled}
    onClick={onNameSubmit}
    >Change</button>
    </>
  )
}

export default NameEditComponent;