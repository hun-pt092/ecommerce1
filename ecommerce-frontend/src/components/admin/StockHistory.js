import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Space, message } from 'antd';
import apiClient from '../../api/apiClient';
import StockHistoryTable from '../../components/admin/StockHistoryTable';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StockHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    transactionType: 'all',
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (filters.startDate) {
        params.start_date = filters.startDate;
      }
      if (filters.endDate) {
        params.end_date = filters.endDate;
      }
      if (filters.transactionType !== 'all') {
        params.transaction_type = filters.transactionType;
      }

      const response = await apiClient.get('/admin/stock/history/', { params });
      setHistory(response.data.results || response.data);
    } catch (error) {
      message.error('Không thể tải lịch sử giao dịch');
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates, dateStrings) => {
    setFilters({
      ...filters,
      startDate: dateStrings[0],
      endDate: dateStrings[1],
    });
  };

  const handleTypeChange = (value) => {
    setFilters({
      ...filters,
      transactionType: value,
    });
  };

  const handleRefresh = () => {
    fetchHistory();
  };

  return (
    <div>
      <Card>
        <h2 style={{ marginBottom: 16 }}>📜 Lịch sử giao dịch kho</h2>

        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            onChange={handleDateChange}
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ width: 300 }}
          />
          
          <Select
            value={filters.transactionType}
            onChange={handleTypeChange}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả giao dịch</Option>
            <Option value="import"> Nhập kho</Option>
            <Option value="sale">🛒 Bán hàng</Option>
            <Option value="return">↩️ Trả hàng</Option>
            <Option value="adjustment">⚙️ Điều chỉnh</Option>
            <Option value="damaged">🔴 Hàng hỏng</Option>
            <Option value="reserved">🔒 Giữ hàng</Option>
            <Option value="released">🔓 Trả hàng giữ</Option>
          </Select>
        </Space>

        <StockHistoryTable
          history={history}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </Card>
    </div>
  );
};

export default StockHistory;