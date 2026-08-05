import * as React from 'react';
import { type MemberEntity } from '../model/member'
import { useState } from 'react'; 
const MemberRow = (props)=>{
  const { member} = props;
  return (
    <tr>
      <td>
        <img src={member.avatar_url} style={{maxWidth:"10rem"}} />
      </td>
      <td>
        <span>{member.id}</span>
      </td>
      <td><span>{member.login}</span></td>
    </tr>
  )
}

const MemberTable:React.FC =() =>{
  const [memberCollection, setMemberCollection] = useState<MemberEntity[]>([
    {
      id:1,
      avatar_url:'https://p6-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/53bf674817fd4ea0a4158bc46c25d382~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgR3VXZW55dWU=:q75.awebp?rk3s=f64ab15b&x-expires=1785948476&x-signature=GHzpr480XeJaeBq2nHjcpwik7LA%3D',
      login:"祖豪"
    },
    {
      id:2,
      avatar_url:'https://p6-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/53bf674817fd4ea0a4158bc46c25d382~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgR3VXZW55dWU=:q75.awebp?rk3s=f64ab15b&x-expires=1785948476&x-signature=GHzpr480XeJaeBq2nHjcpwik7LA%3D',
      login:"阿杰"
    }
  ])
  React.useEffect(()=>{
    // 挂载后请求接口
    // TODO: 实现 getMembersCollection 函数获取远端数据
    // (async()=>{
    //     const members=await getMembersCollection();
    //     setMemberCollection(members);
    // })()
  },[])
  return (
    <>
    <table>
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Id</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {
          memberCollection.map((member)=>(
            <MemberRow key={member.id} member={member}></MemberRow>
          ))
        }
      </tbody>
    </table>
    </>
  )
}

export default MemberTable;