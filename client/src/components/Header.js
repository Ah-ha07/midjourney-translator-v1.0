import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  TranslationOutlined, 
  HistoryOutlined,
  BulbOutlined
} from '@ant-design/icons';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/translate',
      icon: <TranslationOutlined />,
      label: '智能翻译'
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: '翻译历史'
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <BulbOutlined className="logo-icon" />
          <Title level={3} className="logo-text">
            Midjourney翻译助手
          </Title>
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="header-menu"
        />
      </div>
    </AntHeader>
  );
};

export default Header;
