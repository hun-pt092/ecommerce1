// src/api/analyticsApi.js
import apiClient from './apiClient';

/**
 * Analytics API functions
 */

// 1. Doanh thu tổng quan
export const getRevenueAnalytics = async (period = 'month') => {
  try {
    const response = await apiClient.get('/admin/analytics/revenue/', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

// 2. Doanh thu theo thời gian (timeline)
export const getRevenueTimeline = async (days = 30) => {
  try {
    const response = await apiClient.get('/admin/analytics/revenue/timeline/', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue timeline:', error);
    throw error;
  }
};

// 3. Top khách hàng VIP
export const getTopCustomers = async (limit = 10, sortBy = 'spent') => {
  try {
    const response = await apiClient.get('/admin/analytics/customers/top/', {
      params: { limit, sort_by: sortBy }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top customers:', error);
    throw error;
  }
};

// 4. Khách hàng mới
export const getNewCustomers = async (days = 30) => {
  try {
    const response = await apiClient.get('/admin/analytics/customers/new/', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching new customers:', error);
    throw error;
  }
};

// 5. Sản phẩm bán chạy
export const getBestSellingProducts = async (limit = 10) => {
  try {
    const response = await apiClient.get('/admin/analytics/products/best-sellers/', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    throw error;
  }
};

// 6. Doanh thu theo danh mục
export const getCategoryRevenue = async () => {
  try {
    const response = await apiClient.get('/admin/analytics/categories/revenue/');
    return response.data;
  } catch (error) {
    console.error('Error fetching category revenue:', error);
    throw error;
  }
};

// Helper function: Format tiền VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Helper function: Format số ngắn gọn (1M, 10M, etc)
export const formatShortCurrency = (amount) => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
};

// Helper function: Format ngày
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Helper function: VIP tier colors
export const getVipTierColor = (tier) => {
  const colors = {
    Diamond: '#b9f2ff',
    Platinum: '#e5e4e2',
    Gold: '#ffd700',
    Silver: '#c0c0c0',
    Bronze: '#cd7f32',
    Regular: '#808080'
  };
  return colors[tier] || '#808080';
};
