// 页面级别的组件 级别比单纯构成页面的组件高
//view
import { useParams } from 'react-router-dom';

function User() {
  const { id } = useParams();
  return (
    <>
      <h2>User 用户</h2>
      <p>用户 ID: {id}</p>
    </>
  );
}
export default User;
