import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ 
  position = 'fixed', 
  top = '5px', 
  right = '20px',
  style = {},
  size = 'large'
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const defaultStyle = position === 'fixed' ? {
    position: 'fixed',
    top: top,
    right: right,
    zIndex: 1000,
    ...style
  } : style;

  return (
    <div style={defaultStyle}>
      <Button
        type="primary"
        shape="circle"
        size={size}
        icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />}
        onClick={toggleTheme}
        style={{
          background: isDarkMode ? '#725d24d7' : '#1890ff',
          borderColor: isDarkMode ? '#725d24d7' : '#1890ff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      />
    </div>
  );
};

export default ThemeToggle;