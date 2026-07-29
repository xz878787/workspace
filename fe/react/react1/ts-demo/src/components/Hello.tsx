import * as React from 'react';
// props 需要满足的接口约束
interface Props {
  userName: string;
};
// type Props={
//     username: string;
// };
const Hello:React.FC<Props> = (props)=>{
 return (
    <h1>Hello {props.userName}!</h1>
  )

}

export default Hello