import api from "./api";

const unwrap = (promise) =>
  promise
    .then((res) => res.data)
    .catch((error) => {
      console.error("Payment service error:", error?.response?.data || error);
      throw error;
    });

export const paymentService = {
  /**
   * Tạo thanh toán gói dịch vụ qua cổng thanh toán tổng.
   * @param {"momo"|"vnpay"|"zalopay"} gateway
   * @param {"PRO"|"PREMIUM"} packageName
   */
  createPayment: (gateway, packageName) =>
    unwrap(
      api.post("/payments/create", {
        gateway,
        package: packageName,
      })
    ),
};


