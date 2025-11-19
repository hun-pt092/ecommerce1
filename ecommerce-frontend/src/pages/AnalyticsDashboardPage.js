// src/pages/AnalyticsDashboardPage.js
import React, { useState, useEffect } from 'react';
import { 
  getRevenueAnalytics, 
  getRevenueTimeline, 
  getTopCustomers,
  getBestSellingProducts,
  getCategoryRevenue,
  formatCurrency,
  formatShortCurrency
} from '../api/analyticsApi';
import RevenueChart from '../components/analytics/RevenueChart';
import CategoryPieChart from '../components/analytics/CategoryPieChart';
import TopCustomersCard from '../components/analytics/TopCustomersCard';
import TopProductsTable from '../components/analytics/TopProductsTable';
import './AnalyticsDashboardPage.css';

const AnalyticsDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [timelineDays, setTimelineDays] = useState(30);
  
  const [revenueData, setRevenueData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [customersData, setCustomersData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [period, timelineDays]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [revenue, timeline, customers, products, categories] = await Promise.all([
        getRevenueAnalytics(period),
        getRevenueTimeline(timelineDays),
        getTopCustomers(10, 'spent'),
        getBestSellingProducts(10),
        getCategoryRevenue()
      ]);

      setRevenueData(revenue);
      setTimelineData(timeline);
      setCustomersData(customers);
      setProductsData(products);
      setCategoriesData(categories);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      alert('Không thể tải dữ liệu analytics. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu analytics...</p>
      </div>
    );
  }

  const summary = revenueData?.summary || {};
  const growthClass = summary.revenue_growth_percent >= 0 ? 'positive' : 'negative';

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p className="subtitle">Thống kê doanh số & khách hàng</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        {/* Card 1: Tổng doanh thu */}
        <div className="summary-card" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div className="card-content">
            <div className="card-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
              TỔNG DOANH THU
            </div>
            <div className="card-value" style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0' }}>
              {formatShortCurrency(summary.total_revenue || 0)}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '14px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              width: 'fit-content'
            }}>
              <span style={{ marginRight: '6px', fontSize: '16px' }}>
                {summary.revenue_growth_percent >= 0 ? '📈' : '📉'}
              </span>
              <span style={{ fontWeight: '600' }}>
                {summary.revenue_growth_percent >= 0 ? '+' : ''}{(summary.revenue_growth_percent || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Đơn hàng */}
        <div className="summary-card" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white'
        }}>
          <div className="card-content">
            <div className="card-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
              ĐÃ BÁN
            </div>
            <div className="card-value" style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0' }}>
              {summary.total_orders || 0} Đơn
            </div>
            <div style={{ 
              fontSize: '13px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              width: 'fit-content',
              fontWeight: '500'
            }}>
              {summary.total_products_sold || 0} sản phẩm
            </div>
          </div>
        </div>

        {/* Card 3: Giá trị TB */}
        <div className="summary-card" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white'
        }}>
          <div className="card-content">
            <div className="card-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
              GIÁ TRỊ TB/ĐơN
            </div>
            <div className="card-value" style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0' }}>
              {formatShortCurrency(summary.average_order_value || 0)}
            </div>
            <div style={{ 
              fontSize: '13px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              width: 'fit-content',
              fontWeight: '500'
            }}>
              Average Order Value
            </div>
          </div>
        </div>

        {/* Card 4: Giảm giá */}
        <div className="summary-card" style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white'
        }}>
          <div className="card-content">
            <div className="card-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
              ƯU ĐÃI ĐÃ DÙNG
            </div>
            <div className="card-value" style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0' }}>
              {formatShortCurrency(summary.total_discount || 0)}
            </div>
            <div style={{ 
              fontSize: '13px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              width: 'fit-content',
              fontWeight: '500'
            }}>
              Giá gốc: {formatShortCurrency(summary.revenue_before_discount || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Timeline Chart */}
      <div className="analytics-section">
        <div className="section-header">
          <h2>📈 Doanh thu theo thời gian</h2>
          <div className="section-controls">
            <select 
              value={timelineDays} 
              onChange={(e) => setTimelineDays(Number(e.target.value))}
              className="period-select"
            >
              <option value={7}>7 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={60}>60 ngày</option>
              <option value={90}>90 ngày</option>
            </select>
          </div>
        </div>
        <div className="chart-container">
          <RevenueChart data={timelineData} type="area" />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="analytics-grid">
        {/* Left Column */}
        <div className="analytics-column">
          {/* Top Customers */}
          <div className="analytics-section">
            <div className="section-header">
              <h2>💎 Top Khách Hàng VIP</h2>
            </div>
            <div className="section-content">
              <TopCustomersCard data={customersData} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="analytics-column">
          {/* Category Revenue */}
          <div className="analytics-section">
            <div className="section-header">
              <h2>🏷️ Doanh thu theo danh mục</h2>
            </div>
            <div className="section-content">
              <CategoryPieChart data={categoriesData} />
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="analytics-section">
        <div className="section-header">
          <h2>🔥 Top Sản Phẩm Bán Chạy</h2>
        </div>
        <div className="section-content">
          <TopProductsTable data={productsData} />
        </div>
      </div>

      {/* Period Selector at Bottom */}
      <div className="period-selector">
        <button 
          className={period === 'today' ? 'active' : ''}
          onClick={() => setPeriod('today')}
        >
          Hôm nay
        </button>
        <button 
          className={period === 'week' ? 'active' : ''}
          onClick={() => setPeriod('week')}
        >
          Tuần này
        </button>
        <button 
          className={period === 'month' ? 'active' : ''}
          onClick={() => setPeriod('month')}
        >
          Tháng này
        </button>
        <button 
          className={period === 'year' ? 'active' : ''}
          onClick={() => setPeriod('year')}
        >
          Năm nay
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
