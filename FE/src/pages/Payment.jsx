import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Payment() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Implement payment API call
      console.log('Processing payment:', { amount, paymentMethod });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Đang xử lý nạp ${parseFloat(amount).toLocaleString('vi-VN')} ₫ qua ${paymentMethod}`);
      setAmount('');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  // Hàm xử lý cộng dồn giá trị khi click nút chọn nhanh
  const handleQuickAmount = (quickValue) => {
    // Lấy giá trị hiện tại trong input, loại bỏ dấu phân cách
    const currentAmount = amount ? parseFloat(amount.toString().replace(/\./g, '').replace(/,/g, '')) : 0;
    
    // Cộng thêm giá trị mới
    const newAmount = currentAmount + quickValue;
    
    // Cập nhật state
    setAmount(newAmount.toString());
  };

  const quickAmounts = [5000000, 10000000, 20000000, 50000000, 70000000];

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">
                <i className="fas fa-wallet me-3"></i>Nạp tiền vào tài khoản
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h3 className="text-primary mb-4">
                    <i className="fas fa-credit-card me-2"></i>Thông tin nạp tiền
                  </h3>

                  <form onSubmit={handleSubmit}>
                    {/* Amount Input */}
                    <div className="mb-4">
                      <label htmlFor="amount" className="form-label fw-bold">
                        Số tiền nạp (VNĐ)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        className="form-control form-control-lg"
                        placeholder="Nhập số tiền"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="10000"
                        step="1000"
                        required
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-bold mb-0">Chọn nhanh</label>
                        {amount && parseFloat(amount) > 0 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setAmount('')}
                            style={{ fontSize: '12px', padding: '4px 12px' }}
                          >
                            <i className="fas fa-times me-1"></i>
                            Xóa
                          </button>
                        )}
                      </div>
                      <div className="quick-amount-container">
                        {quickAmounts.map((value) => (
                          <button
                            key={value}
                            type="button"
                            className="btn btn-primary quick-amount-btn"
                            onClick={() => handleQuickAmount(value)}
                          >
                            +{value.toLocaleString('vi-VN')} ₫
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Phương thức thanh toán</label>
                      <div className="payment-methods">
                        <div className="form-check mb-3 p-3 payment-method-item rounded">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="vnpay"
                            value="vnpay"
                            checked={paymentMethod === 'vnpay'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label className="form-check-label w-100" htmlFor="vnpay">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-wallet fa-2x text-primary me-3"></i>
                              <div>
                                <div className="fw-bold">VNPay</div>
                                <small className="text-muted">Thanh toán qua VNPay</small>
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="form-check mb-3 p-3 payment-method-item rounded">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="momo"
                            value="momo"
                            checked={paymentMethod === 'momo'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label className="form-check-label w-100" htmlFor="momo">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-mobile-alt fa-2x text-danger me-3"></i>
                              <div>
                                <div className="fw-bold">MoMo</div>
                                <small className="text-muted">Ví điện tử MoMo</small>
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="form-check mb-3 p-3 payment-method-item rounded">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="bank"
                            value="bank"
                            checked={paymentMethod === 'bank'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <label className="form-check-label w-100" htmlFor="bank">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-university fa-2x text-success me-3"></i>
                              <div>
                                <div className="fw-bold">Chuyển khoản ngân hàng</div>
                                <small className="text-muted">Chuyển khoản trực tiếp</small>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Amount Preview */}
                    {amount && parseFloat(amount) > 0 && (
                      <div className="alert alert-info mb-4">
                        <h5 className="mb-2">
                          <i className="fas fa-info-circle me-2"></i>Thông tin thanh toán
                        </h5>
                        <div className="d-flex justify-content-between">
                          <span>Số tiền nạp:</span>
                          <strong className="text-primary">
                            {parseFloat(amount).toLocaleString('vi-VN')} ₫
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-3">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg flex-grow-1"
                        disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                      >
                        {isProcessing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle me-2"></i>
                            Xác nhận nạp tiền
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => navigate(-1)}
                        disabled={isProcessing}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Quay lại
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Payment Info */}
              <div className="card shadow-sm mt-4">
                <div className="card-body p-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-question-circle me-2"></i>Lưu ý khi nạp tiền
                  </h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Số tiền nạp tối thiểu: 10,000 ₫
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Thời gian xử lý: 5-10 phút
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Bạn sẽ nhận được thông báo khi giao dịch thành công
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Liên hệ hỗ trợ nếu có vấn đề: support@property.com
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

