// src/components/analytics/TopCustomersCard.js
import React from 'react';
import { formatShortCurrency } from '../../api/analyticsApi';

const TopCustomersCard = ({ data }) => {
  if (!data || !data.top_customers || !Array.isArray(data.top_customers) || data.top_customers.length === 0) {
    return (
      <div className="analytics-card-empty">
        <p>Chưa có dữ liệu khách hàng</p>
      </div>
    );
  }

  // Filter out null/undefined items
  const validCustomers = (data.top_customers || []).filter(customer => 
    customer && customer.id && customer.username
  );

  if (validCustomers.length === 0) {
    return (
      <div className="analytics-card-empty">
        <p>Chưa có dữ liệu khách hàng</p>
      </div>
    );
  }

  const getVipBadgeStyle = (tier, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: color,
    color: tier === 'Diamond' || tier === 'Platinum' ? '#000' : '#fff',
    border: `2px solid ${color}`,
  });

  return (
    <div className="top-customers-card">
      {/* VIP Tiers Summary */}
      <div className="vip-summary" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        {Object.entries(data.vip_tiers_count || {}).map(([tier, count]) => {
          const info = data.vip_tiers_info[tier];
          return (
            <div key={tier} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{info.icon}</div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{tier}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f46e5' }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Top Customers List */}
      <div className="customers-list">
        {validCustomers.map((customer, index) => (
          <div 
            key={customer.id}
            className="customer-card"
            style={{
              padding: '16px',
              marginBottom: '12px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginRight: '12px',
                    fontSize: '14px'
                  }}>
                    #{index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '2px' }}>
                      {customer.username}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {customer.email}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                      Tổng chi tiêu
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4f46e5' }}>
                      {formatShortCurrency(customer.total_spent || 0)} VND
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                      Đơn hàng
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                      {customer.total_orders || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                      TB/đơn
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {formatShortCurrency(customer.average_order_value || 0)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginLeft: '16px' }}>
                <div style={getVipBadgeStyle(customer.vip_tier || 'Regular', customer.vip_color || '#94a3b8')}>
                  <span style={{ marginRight: '4px' }}>{customer.vip_icon || '👤'}</span>
                  {customer.vip_tier || 'Regular'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.total > 10 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px',
          padding: '12px',
          color: '#666',
          fontSize: '14px'
        }}>
          Hiển thị 10/{data.total} khách hàng
        </div>
      )}
    </div>
  );
};

export default TopCustomersCard;
