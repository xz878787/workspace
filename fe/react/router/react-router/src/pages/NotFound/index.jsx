import{
    useEffect
} from 'react';

const NotFound=()=> {
  useEffect(()=>{
   setTimeout(()=>{
    window.location.href='/';
    // navigate('/');
   },3000);
  },[]);
  return (
    <>
      <h2>404 页面不存在</h2>
      <p>你访问的页面走丢了</p>
    </>
  );
}
export default NotFound;
