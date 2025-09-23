import React from 'react';
import { Layout as AntLayout } from 'antd';
import Navigation from './Navigation';

const { Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Navigation />
      <Content style={{ padding: '0', minHeight: 'calc(100vh - 64px - 70px)' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>Fashion Store</strong> - Thời trang chất lượng cao
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            © 2025 Fashion Store. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </Footer>
    </AntLayout>
  );
};

export default Layout;