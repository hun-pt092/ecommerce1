import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ 
  position = 'fixed', 
  top = '5px', 
  right = '20px',
  style = {},
  size = 'middle',
  inNavigation = false
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const defaultStyle = position === 'fixed' ? {
    position: 'fixed',
    top: top,
    right: right,
    zIndex: 1000,
    ...style
  } : style;

  // Style cho navigation
  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    ...style
  };

  return (
    <div style={inNavigation ? navStyle : defaultStyle}>
      <Tooltip title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
        <Button
          type={inNavigation ? 'text' : 'primary'}
          shape="circle"
          size={size}
          icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleTheme}
          style={inNavigation ? {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDarkMode ? '#faad14' : '#1890ff',
            fontSize: '20px',
            transition: 'all 0.3s ease'
          } : {
            background: isDarkMode ? '#725d24d7' : '#1890ff',
            borderColor: isDarkMode ? '#725d24d7' : '#1890ff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
      </Tooltip>
    </div>
  );
};

export default ThemeToggle;