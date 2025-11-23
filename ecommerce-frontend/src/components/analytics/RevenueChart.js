// src/components/analytics/RevenueChart.js
import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatShortCurrency, formatDate } from '../../api/analyticsApi';

const RevenueChart = ({ data, type = 'line' }) => {
  // Handle bar chart (for monthly comparison) - different data structure
  if (type === 'bar' && data && data.labels && data.datasets) {
    const barData = data.labels.map((label, index) => ({
      name: label,
      revenue: data.datasets[0].data[index]
    }));

    return (
      <div className="revenue-chart">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 14, fontWeight: 600 }}
              stroke="#999"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatShortCurrency(value)}
              stroke="#999"
            />
            <Tooltip 
              formatter={(value) => [formatShortCurrency(value) + ' VND', 'Doanh thu']}
              contentStyle={{
                backgroundColor: 'white',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                <stop offset="100%" stopColor="#764ba2" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
        <div className="chart-summary" style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Tăng trưởng</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: barData[1].revenue >= barData[0].revenue ? '#10b981' : '#ef4444' }}>
            {barData[0].revenue > 0 ? (((barData[1].revenue - barData[0].revenue) / barData[0].revenue * 100).toFixed(1)) : '0.0'}%
            <span style={{ fontSize: '16px', marginLeft: '8px' }}>
              {barData[1].revenue >= barData[0].revenue ? '📈' : '📉'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {formatShortCurrency(Math.abs(barData[1].revenue - barData[0].revenue))} VND so với tháng trước
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.timeline || !Array.isArray(data.timeline) || data.timeline.length === 0) {
    return (
      <div className="analytics-chart-empty">
        <p>Chưa có dữ liệu doanh thu</p>
      </div>
    );
  }

  // Filter out null/undefined items
  const validTimeline = (data.timeline || []).filter(item => 
    item && item.date && item.revenue != null
  );

  if (validTimeline.length === 0) {
    return (
      <div className="analytics-chart-empty">
        <p>Chưa có dữ liệu doanh thu</p>
      </div>
    );
  }

  // Format data cho chart
  const chartData = validTimeline.map(item => ({
    date: new Date(item.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    fullDate: item.date,
    revenue: item.revenue || 0,
    orders: item.orders || 0,
    discount: item.discount || 0
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
            {formatDate(payload[0].payload.fullDate)}
          </p>
          <p style={{ color: '#4f46e5', marginBottom: '4px' }}>
            Doanh thu: <strong>{formatShortCurrency(payload[0].value)} VND</strong>
          </p>
          <p style={{ color: '#10b981', marginBottom: '4px' }}>
            Đơn hàng: <strong>{payload[0].payload.orders}</strong>
          </p>
          {payload[0].payload.discount > 0 && (
            <p style={{ color: '#ef4444' }}>
              Giảm giá: <strong>{formatShortCurrency(payload[0].payload.discount)} VND</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const chartComponent = type === 'area' ? (
    <AreaChart data={chartData}>
      <defs>
        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis 
        dataKey="date" 
        tick={{ fontSize: 12 }}
        stroke="#999"
      />
      <YAxis 
        tick={{ fontSize: 12 }}
        tickFormatter={(value) => formatShortCurrency(value)}
        stroke="#999"
      />
      <Tooltip content={<CustomTooltip />} />
      <Area 
        type="monotone" 
        dataKey="revenue" 
        stroke="#4f46e5" 
        fillOpacity={1} 
        fill="url(#colorRevenue)"
        strokeWidth={2}
      />
    </AreaChart>
  ) : (
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis 
        dataKey="date" 
        tick={{ fontSize: 12 }}
        stroke="#999"
      />
      <YAxis 
        tick={{ fontSize: 12 }}
        tickFormatter={(value) => formatShortCurrency(value)}
        stroke="#999"
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="#4f46e5" 
        strokeWidth={3}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
        name="Doanh thu"
      />
    </LineChart>
  );

  return (
    <div className="revenue-chart">
      <ResponsiveContainer width="100%" height={350}>
        {chartComponent}
      </ResponsiveContainer>
      <div className="chart-summary" style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tổng doanh thu</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f46e5' }}>
            {formatShortCurrency(data.summary?.total_revenue || 0)} VND
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tổng đơn hàng</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
            {data.summary?.total_orders || 0}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Trung bình/ngày</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
            {formatShortCurrency(data.summary?.average_daily_revenue || 0)} VND
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
