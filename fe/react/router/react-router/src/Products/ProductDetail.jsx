import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { productId } = useParams();
  return (
    <>
      <h3>产品详情</h3>
      <p>产品 ID: {productId}</p>
    </>
  );
}

export default ProductDetail;
