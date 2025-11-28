import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">About</h1>
              <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="200">
                
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row text-left mb-5">
            <div className="col-12">
              <h2 className="font-weight-bold heading text-primary mb-4">Giới thiệu</h2>
            </div>
            <div className="col-lg-6">
              <p className="text-black-50">
              Chúng tôi là nền tảng tiên phong trong lĩnh vực Bất động sản Thông minh (Smart Real Estate), chuyên cung cấp các giao dịch mua bán và cho thuê căn hộ được tích hợp sẵn hệ thống Internet Vạn Vật (IoT) và công nghệ nhà thông minh.
              </p>
              <p className="text-black-50">
              Chúng tôi không chỉ bán một ngôi nhà, chúng tôi mang đến một phong cách sống kết nối, tiện nghi và an toàn thông qua công nghệ. Mỗi căn hộ trên nền tảng của chúng tôi đều được kiểm định về chất lượng xây dựng và mức độ tích hợp của hệ thống Smart Home.
              </p>
              <p className="text-black-50">
              Tầm nhìn: Dẫn đầu thị trường bất động sản bằng cách số hóa trải nghiệm sống, biến mọi ngôi nhà trở thành một không gian thông minh, tự động hóa và tiết kiệm năng lượng.
              </p>
            </div>           
          </div>

          <div className="row mb-5">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <img src="/images/hero_bg_3.jpg" alt="About" className="img-fluid" />
            </div>
            <div className="col-lg-6">
              <h3 className="text-primary mb-4">Our Mission</h3>
              <p className="text-black-50"/>
              Chúng tôi cam kết mang lại những căn hộ tích hợp công nghệ đỉnh cao, bao gồm:
              <ul className="list-unstyled mt-4">
                <li className="d-flex mb-3">
                  <span className="icon-check text-primary me-3"></span>
                  <span className="text-black-50">Hệ thống Khóa Thông minh: Mở khóa cửa bằng khuôn mặt (Face ID), vân tay, hoặc ứng dụng di động, loại bỏ hoàn toàn chìa khóa cơ.</span>
                </li>
                <li className="d-flex mb-3">
                  <span className="icon-check text-primary me-3"></span>
                  <span className="text-black-50">Cảm biến Môi trường & Cảnh báo: Tích hợp hệ thống báo động rò rỉ khí gas, cảm biến nhiệt độ và độ ẩm theo dõi chất lượng không khí.</span>
                </li>
                <li className="d-flex mb-3">
                  <span className="icon-check text-primary me-3"></span>
                  <span className="text-black-50">Đèn Cảm biến Thông minh: Tự động bật/tắt khi có người hoặc điều chỉnh cường độ sáng phù hợp với môi trường.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

