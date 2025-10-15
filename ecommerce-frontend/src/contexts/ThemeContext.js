import React, { createContext, useContext, useState, useEffect } from 'react';

// Tạo Theme Context
const ThemeContext = createContext();

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Lấy theme từ localStorage hoặc mặc định là light mode
    return localStorage.getItem('theme') === 'dark';
  });

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Theme colors
  const theme = {
    backgroundColor: isDarkMode ? '#141414' : '#ffffff',
    cardBackground: isDarkMode ? '#1f1f1f' : '#ffffff',
    textColor: isDarkMode ? '#ffffff' : '#000000',
    secondaryText: isDarkMode ? '#bfbfbf' : '#666666',
    borderColor: isDarkMode ? '#303030' : '#d9d9d9',
    shadowColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  };

  useEffect(() => {
    // Apply theme on mount and when changed
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [isDarkMode, theme.backgroundColor, theme.textColor]);

  const value = {
    isDarkMode,
    toggleTheme,
    theme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook để sử dụng Theme Context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;