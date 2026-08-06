import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Pay = () => {
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('wechat');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const order = {
    id: 'ORD' + Date.now(),
    name: '天龙八部 RAG 助手 - 年度会员',
    price: 99.00,
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLogin');
    navigate('/login');
  };

  if (paySuccess) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h2>✅ 支付成功</h2>
        <p>订单号：{order.id}</p>
        <p>金额：¥{order.price}</p>
        <p>即将跳转首页...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <h2>支付页面</h2>

      <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3>{order.name}</h3>
        <p>订单号：{order.id}</p>
        <p style={{ fontSize: 24, color: '#e4393c', fontWeight: 'bold' }}>
          ¥{order.price.toFixed(2)}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3>选择支付方式</h3>
        <label style={{ display: 'block', padding: 8, cursor: 'pointer' }}>
          <input
            type="radio"
            name="payMethod"
            value="wechat"
            checked={payMethod === 'wechat'}
            onChange={(e) => setPayMethod(e.target.value)}
          />
          微信支付
        </label>
        <label style={{ display: 'block', padding: 8, cursor: 'pointer' }}>
          <input
            type="radio"
            name="payMethod"
            value="alipay"
            checked={payMethod === 'alipay'}
            onChange={(e) => setPayMethod(e.target.value)}
          />
          支付宝
        </label>
      </div>

      <button
        onClick={handlePay}
        disabled={paying}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: 16,
          backgroundColor: paying ? '#ccc' : '#e4393c',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: paying ? 'not-allowed' : 'pointer',
        }}
      >
        {paying ? '支付中...' : `确认支付 ¥${order.price.toFixed(2)}`}
      </button>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 12,
          width: '100%',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        退出登录
      </button>
    </div>
  );
};

export default Pay;
