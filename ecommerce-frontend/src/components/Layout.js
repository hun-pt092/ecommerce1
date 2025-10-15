import React from 'react';
import { Layout as AntLayout } from 'antd';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';

const { Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  const location = useLocation();

  // Function to check if link is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>{`
        .footer-link {
          color: #ccc !important;
          text-decoration: none !important;
          transition: all 0.3s ease;
        }
        .footer-link:hover {
          color: #1890ff !important;
          text-decoration: underline !important;
        }
        .footer-link.active {
          color: #1890ff !important;
          text-decoration: underline !important;
          font-weight: bold;
        }
        .footer-social-link {
          color: #1890ff !important;
          text-decoration: none !important;
          transition: all 0.3s ease;
        }
        .footer-social-link:hover {
          color: #40a9ff !important;
          text-decoration: underline !important;
        }
      `}</style>
      <AntLayout style={{ minHeight: '100vh' }}>
      <Navigation />
      <Content style={{ padding: '0', minHeight: 'calc(100vh - 64px - 70px)' }}>
        {children}
      </Content>
      <Footer style={{ background: '#001529', color: 'white', padding: '40px 0 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px',
            marginBottom: '30px'
          }}>
            {/* Company Info */}
            <div>
              <h3 style={{ color: '#1890ff', marginBottom: '16px', fontSize: '18px' }}>
                Fashion Store
              </h3>
              <p style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                Thời trang chất lượng cao với phong cách hiện đại
              </p>
              <p style={{ marginBottom: '8px' }}>
                📍 123 Đường ABC, Quận 1, TP.HaNoi
              </p>
              <p style={{ marginBottom: '8px' }}>
                📞 (028) 1234 5678
              </p>
              <p style={{ marginBottom: '8px' }}>
                ✉️ contact@fashionstore.com
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: '#1890ff', marginBottom: '16px' }}>
                Liên kết nhanh
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/" className={`footer-link ${isActiveLink('/') ? 'active' : ''}`}>Trang chủ</a>
                <a href="/products" className={`footer-link ${isActiveLink('/products') ? 'active' : ''}`}>Sản phẩm</a>
                <a href="/about" className={`footer-link ${isActiveLink('/about') ? 'active' : ''}`}>Về chúng tôi</a>
                <a href="/contact" className={`footer-link ${isActiveLink('/contact') ? 'active' : ''}`}>Liên hệ</a>
              </div>
            </div>

            {/* Customer Support */}
            <div>
              <h4 style={{ color: '#1890ff', marginBottom: '16px' }}>
                Hỗ trợ khách hàng
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/shipping-policy" className={`footer-link ${isActiveLink('/shipping-policy') ? 'active' : ''}`}>Chính sách giao hàng</a>
                <a href="/return-policy" className={`footer-link ${isActiveLink('/return-policy') ? 'active' : ''}`}>Chính sách đổi trả</a>
                <a href="/privacy-policy" className={`footer-link ${isActiveLink('/privacy-policy') ? 'active' : ''}`}>Chính sách bảo mật</a>
                <a href="/terms-of-service" className={`footer-link ${isActiveLink('/terms-of-service') ? 'active' : ''}`}>Điều khoản sử dụng</a>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 style={{ color: '#1890ff', marginBottom: '16px' }}>
                Kết nối với chúng tôi
              </h4>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                   style={{ color: '#1890ff', fontSize: '20px', textDecoration: 'none' }}>
                  📘 Facebook
                </a>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                   style={{ color: '#1890ff', fontSize: '20px', textDecoration: 'none' }}>
                  📷 Instagram
                </a>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" 
                   style={{ color: '#1890ff', fontSize: '20px', textDecoration: 'none' }}>
                  🎥 YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ 
            borderTop: '1px solid #333', 
            paddingTop: '20px', 
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              © 2025 Fashion Store. Tất cả quyền được bảo lưu.
            </div>
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              Thiết kế bởi Fashion Store Team | Phiên bản 1.0
            </div>
          </div>
        </div>
      </Footer>
    </AntLayout>
    </>
  );
};

export default Layout;