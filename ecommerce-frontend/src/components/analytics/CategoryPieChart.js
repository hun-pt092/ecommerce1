// src/components/analytics/CategoryPieChart.js
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatShortCurrency } from '../../api/analyticsApi';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const CategoryPieChart = ({ data }) => {
  if (!data || !data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
    return (
      <div className="analytics-chart-empty">
        <p>Chưa có dữ liệu danh mục</p>
      </div>
    );
  }

  // Filter out null/undefined items
  const validCategories = (data.categories || []).filter(item => 
    item && item.category_name && item.revenue != null
  );

  if (validCategories.length === 0) {
    return (
      <div className="analytics-chart-empty">
        <p>Chưa có dữ liệu danh mục</p>
      </div>
    );
  }

  // Format data cho chart
  const chartData = validCategories.map(item => ({
    name: item.category_name,
    value: item.revenue || 0,
    percentage: item.percentage || 0,
    quantity: item.quantity_sold || 0,
    orders: item.order_count || 0
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
            {payload[0].name}
          </p>
          <p style={{ color: '#4f46e5', marginBottom: '4px' }}>
            Doanh thu: <strong>{formatShortCurrency(payload[0].value)} VND</strong>
          </p>
          <p style={{ color: '#10b981', marginBottom: '4px' }}>
            Tỷ lệ: <strong>{payload[0].payload.percentage.toFixed(2)}%</strong>
          </p>
          <p style={{ color: '#f59e0b', marginBottom: '4px' }}>
            Số lượng: <strong>{payload[0].payload.quantity}</strong>
          </p>
          <p style={{ color: '#8b5cf6' }}>
            Đơn hàng: <strong>{payload[0].payload.orders}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  return (
    <div className="category-pie-chart">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => `${value}: ${formatShortCurrency(entry.payload.value)} VND`}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="category-list" style={{ marginTop: '20px' }}>
        {validCategories.map((category, index) => (
          <div 
            key={category.category_id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: '3px',
                marginRight: '10px'
              }}></div>
              <span style={{ fontWeight: '500' }}>{category.category_name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#4f46e5' }}>
                {formatShortCurrency(category.revenue || 0)} VND
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {category.quantity_sold || 0} sản phẩm · {category.order_count || 0} đơn
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
