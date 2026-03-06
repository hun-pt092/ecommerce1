import React from 'react';
import { Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import './MegaMenu.css';

const { Title, Text } = Typography;

const MegaMenu = ({ categories, onClose }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/?category=${categoryId}`);
    if (onClose) onClose();
    setTimeout(() => {
      const featuredSection = document.getElementById('featured-products');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Filter parent categories only
  const parentCategories = categories.filter(cat => !cat.parent);

  return (
    <div className="mega-menu-container">
      <Row gutter={[24, 20]}>
        {parentCategories.map(parent => (
          <Col xs={24} sm={12} md={8} lg={6} key={parent.id}>
            <div className="category-block">
              {/* Parent Category */}
              <div 
                className="parent-category"
                onClick={() => handleCategoryClick(parent.id)}
              >
                <Title level={5}>{parent.name}</Title>
                {parent.product_count > 0 && (
                  <Text type="secondary" className="count">({parent.product_count})</Text>
                )}
              </div>

              {/* Children Categories */}
              {parent.children && parent.children.length > 0 && (
                <ul className="child-list">
                  {parent.children.map(child => (
                    <li 
                      key={child.id}
                      onClick={() => handleCategoryClick(child.id)}
                    >
                      <Text>{child.name}</Text>
                      {child.product_count > 0 && (
                        <Text type="secondary" className="count">({child.product_count})</Text>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MegaMenu;
