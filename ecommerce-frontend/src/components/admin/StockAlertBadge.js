import React from 'react';
import { Tag } from 'antd';

const StockAlertBadge = ({ variant, showText = true }) => {
  if (!variant) return null;

  const available = variant.available_quantity || 0;
  const minimumStock = variant.minimum_stock || 5;
  const reorderPoint = variant.reorder_point || 10;

  // Logic giống backend: check theo thứ tự ưu tiên
  let status;
  if (available === 0) {
    status = { color: 'error', text: 'Hết hàng', icon: '🔴' };
  } else if (available <= minimumStock) {
    status = { color: 'warning', text: 'Tồn kho thấp', icon: '⚠️' };
  } else if (available <= reorderPoint) {
    status = { color: 'processing', text: 'Cần đặt hàng', icon: '📦' };
  } else {
    status = { color: 'success', text: 'Đủ hàng', icon: '✅' };
  }

  return (
    <Tag color={status.color}>
      {status.icon} {showText && status.text}
    </Tag>
  );
};

export default StockAlertBadge;