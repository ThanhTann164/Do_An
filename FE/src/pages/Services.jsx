import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Services() {
  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">Services</h1>
              <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="200">
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="font-weight-bold heading text-primary mb-4">Our Services</h2>
              <p className="text-black-50">
                We provide comprehensive real estate services to help you find your dream home.
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="service-item p-4 h-100">
                <span className="flaticon-house display-3 text-primary mb-3 d-block"></span>
                <h3 className="mb-3">Property Listing</h3>
                <p className="text-black-50">
                  Browse through thousands of verified property listings with detailed information and high-quality images.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="service-item p-4 h-100">
                <span className="flaticon-building display-3 text-primary mb-3 d-block"></span>
                <h3 className="mb-3">Property Management</h3>
                <p className="text-black-50">
                  Complete property management services including maintenance, tenant screening, and rent collection.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="service-item p-4 h-100">
                <span className="flaticon-house-3 display-3 text-primary mb-3 d-block"></span>
                <h3 className="mb-3">Real Estate Consulting</h3>
                <p className="text-black-50">
                  Expert advice on property investments, market trends, and real estate opportunities.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="service-item p-4 h-100">
                <span className="flaticon-house-1 display-3 text-primary mb-3 d-block"></span>
                <h3 className="mb-3">Property Valuation</h3>
                <p className="text-black-50">
                  Accurate property valuation services to help you make informed decisions.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="service-item p-4 h-100">
                <span className="icon-security display-3 text-primary mb-3 d-block"></span>
                <h3 className="mb-3">Legal Support</h3>
                <p className="text-black-50">
                  Comprehensive legal support for all your real estate transactions and documentation.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="service-item p-4 h-100">
                <span className="icon-home2 display-3 text-primary mb-3 d-block"></span>
                <h3 className="mb-3">Home Loan Assistance</h3>
                <p className="text-black-50">
                  Help with securing the best home loans and financing options for your property purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

