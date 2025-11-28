import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">Contact Us</h1>
              <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="200">
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-5 mb-lg-0">
              <div className="contact-info">
                <div className="address mt-2">
                  <i className="icon-room"></i>
                  <h4 className="mb-2">Location:</h4>
                  <p>Khu công nghệ cao FPT, Hòa Hải, Ngũ Hành Sơn<br />Thành phố Đà Nẵng</p>
                </div>

                <div className="open-hours mt-4">
                  <i className="icon-clock-o"></i>
                  <h4 className="mb-2">Open Hours:</h4>
                  <p>
                    Monday-Friday:<br />
                    09:00 AM - 05:00 PM
                  </p>
                </div>

                <div className="email mt-4">
                  <i className="icon-envelope"></i>
                  <h4 className="mb-2">Email:</h4>
                  <p>info@mydomain.com</p>
                </div>

                <div className="phone mt-4">
                  <i className="icon-phone"></i>
                  <h4 className="mb-2">Call:</h4>
                  <p>+84-456-7890</p>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <textarea
                      className="form-control"
                      name="message"
                      cols="30"
                      rows="7"
                      placeholder="Message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Đang gửi...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

