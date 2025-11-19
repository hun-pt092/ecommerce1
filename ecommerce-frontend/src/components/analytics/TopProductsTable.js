// src/components/analytics/TopProductsTable.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatShortCurrency } from '../../api/analyticsApi';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#84cc16'];

const TopProductsTable = ({ data }) => {
  // Check if data exists and has valid best_sellers array
  if (!data || !data.best_sellers || !Array.isArray(data.best_sellers) || data.best_sellers.length === 0) {
    return (
      <div className="analytics-card-empty">
        <p>Chưa có dữ liệu sản phẩm</p>
      </div>
    );
  }

  // Filter out null/undefined items and ensure all items have required fields
  const validProducts = (data.best_sellers || []).filter(item => 
    item && item.product_name && item.product_id
  );

  if (validProducts.length === 0) {
    return (
      <div className="analytics-card-empty">
        <p>Chưa có dữ liệu sản phẩm</p>
      </div>
    );
  }

  const chartData = validProducts.map(item => ({
    name: item.product_name.length > 15 ? item.product_name.substring(0, 15) + '...' : item.product_name,
    fullName: item.product_name,
    sold: item.total_sold || 0,
    revenue: item.total_revenue || 0
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {payload[0].payload.fullName}
          </p>
          <p style={{ color: '#4f46e5', marginBottom: '4px' }}>
            Đã bán: <strong>{payload[0].value}</strong>
          </p>
          <p style={{ color: '#10b981' }}>
            Doanh thu: <strong>{formatShortCurrency(payload[0].payload.revenue)} VND</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="top-products-table">
      {/* Bar Chart */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
          Số lượng bán ra
        </h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sold" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Products Table */}
      <div className="products-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#f9fafb', 
              borderBottom: '2px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#666' }}>
                #
              </th>
              <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#666' }}>
                Sản phẩm
              </th>
              <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#666' }}>
                Danh mục
              </th>
              <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#666', textAlign: 'center' }}>
                Đã bán
              </th>
              <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#666', textAlign: 'right' }}>
                Doanh thu
              </th>
              <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#666', textAlign: 'center' }}>
                Đơn hàng
              </th>
            </tr>
          </thead>
          <tbody>
            {validProducts.map((product, index) => (
              <tr 
                key={product.product_id}
                style={{ 
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px 8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: COLORS[index % COLORS.length],
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {index + 1}
                  </div>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                    {product.product_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {product.brand || 'N/A'}
                  </div>
                </td>
                <td style={{ padding: '12px 8px', fontSize: '14px', color: '#666' }}>
                  {product.category || 'N/A'}
                </td>
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#4f46e5'
                }}>
                  {product.total_sold || 0}
                </td>
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  {formatShortCurrency(product.total_revenue || 0)} VND
                </td>
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {product.order_count || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProductsTable;
