import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import { 
  GithubOutlined, 
  HeartFilled,
  RocketOutlined
} from '@ant-design/icons';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <Space direction="vertical" size="small">
            <Space align="center">
              <RocketOutlined className="footer-icon" />
              <Text strong className="footer-title">Midjourney翻译助手</Text>
            </Space>
            <Text type="secondary" className="footer-description">
              让AI绘画创作更简单，学习更高效
            </Text>
          </Space>
        </div>
        
        <Divider type="vertical" className="footer-divider" />
        
        <div className="footer-section">
          <Space direction="vertical" size="small">
            <Text strong>功能特色</Text>
            <Text type="secondary">智能翻译</Text>
            <Text type="secondary">历史记录</Text>
            <Text type="secondary">学习平台</Text>
          </Space>
        </div>
        
        <Divider type="vertical" className="footer-divider" />
        
        <div className="footer-section">
          <Space direction="vertical" size="small">
            <Text strong>技术支持</Text>
            <Text type="secondary">DeepSeek API</Text>
            <Text type="secondary">React + Ant Design</Text>
            <Text type="secondary">Node.js + MongoDB</Text>
          </Space>
        </div>
      </div>
      
      <Divider className="footer-main-divider" />
      
      <div className="footer-bottom">
        <Text type="secondary">
          © 2024 Midjourney翻译助手. Made with <HeartFilled style={{ color: '#ff6b6b' }} /> for AI创作者
        </Text>
        <Space>
          <Link href="https://github.com" target="_blank">
            <GithubOutlined className="footer-link-icon" />
          </Link>
        </Space>
      </div>
    </AntFooter>
  );
};

export default Footer;
