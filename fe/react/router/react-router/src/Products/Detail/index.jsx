import { useParams } from 'react-router-dom';
const ProductDetail=()=> {
  const { productId } = useParams();
  return (
    <>
      <h2> 产品详情:{productId} </h2>
      <p>这是产品详情内容</p>
    </>
  );
}
export default ProductDetail;