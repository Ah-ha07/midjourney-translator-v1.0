import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Statistic,
  Timeline,
  Tag,
  Alert
} from 'antd';
import { 
  RocketOutlined, 
  TranslationOutlined, 
  HistoryOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { translateAPI, healthAPI } from '../services/api';
import './Home.css';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTranslations: 0,
    isHealthy: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
    fetchStats();
  }, []);

  const checkSystemHealth = async () => {
    try {
      await healthAPI.check();
      setStats(prev => ({ ...prev, isHealthy: true }));
    } catch (error) {
      console.error('系统健康检查失败:', error);
      setStats(prev => ({ ...prev, isHealthy: false }));
    }
  };

  const fetchStats = async () => {
    try {
      const response = await translateAPI.getHistory({ page: 1, limit: 1 });
      if (response.data.success) {
        setStats(prev => ({ 
          ...prev, 
          totalTranslations: response.data.data.total 
        }));
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <TranslationOutlined />,
      title: '智能翻译',
      description: '基于DeepSeek AI的专业翻译引擎，专门优化Midjourney提示词翻译',
      color: '#667eea'
    },
    {
      icon: <GlobalOutlined />,
      title: '多语言支持',
      description: '支持中文、英文、日文、韩文四种语言的互译功能',
      color: '#52c41a'
    },
    {
      icon: <SafetyOutlined />,
      title: '术语保护',
      description: '智能识别并保护专业术语，确保翻译的准确性和专业性',
      color: '#1890ff'
    },
    {
      icon: <HistoryOutlined />,
      title: '历史记录',
      description: '自动保存翻译历史，方便查看和管理以往的翻译记录',
      color: '#722ed1'
    }
  ];

  const quickActions = [
    {
      title: '开始翻译',
      description: '立即体验AI翻译功能',
      icon: <TranslationOutlined />,
      action: () => navigate('/translate'),
      type: 'primary',
      size: 'large'
    },
    {
      title: '查看历史',
      description: '浏览翻译记录',
      icon: <HistoryOutlined />,
      action: () => navigate('/history'),
      type: 'default',
      size: 'large'
    }
  ];

  const updateTimeline = [
    {
      color: 'green',
      dot: <CheckCircleOutlined />,
      children: (
        <div>
          <Text strong>核心翻译功能上线</Text>
          <br />
          <Text type="secondary">支持中英日韩四语言翻译</Text>
        </div>
      )
    },
    {
      color: 'blue',
      dot: <ClockCircleOutlined />,
      children: (
        <div>
          <Text strong>历史记录功能</Text>
          <br />
          <Text type="secondary">翻译记录保存和管理</Text>
        </div>
      )
    },
    {
      color: 'gray',
      children: (
        <div>
          <Text type="secondary">图片管理功能</Text>
          <br />
          <Text type="secondary">敬请期待...</Text>
        </div>
      )
    }
  ];

  return (
    <div className="home-page">
      <div className="home-container">
        {/* 英雄区域 */}
        <div className="hero-section">
          <div className="hero-content">
            <Title level={1} className="hero-title">
              <BulbOutlined className="hero-icon" />
              Midjourney翻译助手
            </Title>
            <Paragraph className="hero-description">
              专为AI绘画爱好者打造的智能翻译平台
              <br />
              让创意无国界，让灵感自由流淌
            </Paragraph>
            
            <Space size="large" className="hero-actions">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  type={action.type}
                  size={action.size}
                  icon={action.icon}
                  onClick={action.action}
                  className="hero-button"
                >
                  {action.title}
                </Button>
              ))}
            </Space>

            {/* 系统状态 */}
            <div className="status-section">
              <Alert
                message={
                  <Space>
                    {stats.isHealthy ? (
                      <>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text>系统运行正常</Text>
                      </>
                    ) : (
                      <>
                        <ClockCircleOutlined style={{ color: '#faad14' }} />
                        <Text>系统检测中...</Text>
                      </>
                    )}
                  </Space>
                }
                type={stats.isHealthy ? 'success' : 'warning'}
                showIcon={false}
                className="status-alert"
              />
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <Row gutter={24} className="stats-section">
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="累计翻译"
                value={stats.totalTranslations}
                prefix={<TranslationOutlined />}
                suffix="次"
                valueStyle={{ color: '#667eea' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="支持语言"
                value={4}
                prefix={<GlobalOutlined />}
                suffix="种"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="服务状态"
                value={stats.isHealthy ? "正常" : "检测中"}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: stats.isHealthy ? '#52c41a' : '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 功能特性 */}
        <div className="features-section">
          <Title level={2} className="section-title">
            <RocketOutlined className="section-icon" />
            核心功能
          </Title>
          <Row gutter={24}>
            {features.map((feature, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <Card className="feature-card" hoverable>
                  <div className="feature-icon" style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <Title level={4} className="feature-title">
                    {feature.title}
                  </Title>
                  <Paragraph className="feature-description">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 使用指南 */}
        <Row gutter={24} className="guide-section">
          <Col xs={24} lg={12}>
            <Card className="guide-card">
              <Title level={3}>
                <BulbOutlined style={{ color: '#faad14' }} />
                如何使用
              </Title>
              <Timeline items={[
                {
                  children: (
                    <div>
                      <Text strong>输入提示词</Text>
                      <br />
                      <Text type="secondary">在翻译页面输入你的Midjourney提示词</Text>
                    </div>
                  )
                },
                {
                  children: (
                    <div>
                      <Text strong>选择目标语言</Text>
                      <br />
                      <Text type="secondary">选择你想要翻译到的目标语言</Text>
                    </div>
                  )
                },
                {
                  children: (
                    <div>
                      <Text strong>开始翻译</Text>
                      <br />
                      <Text type="secondary">点击翻译按钮，AI将为你生成专业翻译</Text>
                    </div>
                  )
                },
                {
                  children: (
                    <div>
                      <Text strong>保存或复制</Text>
                      <br />
                      <Text type="secondary">保存到历史记录或直接复制使用</Text>
                    </div>
                  )
                }
              ]} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card className="guide-card">
              <Title level={3}>
                <HistoryOutlined style={{ color: '#667eea' }} />
                更新日志
              </Title>
              <Timeline items={updateTimeline} />
            </Card>
          </Col>
        </Row>

        {/* 推荐标签 */}
        <div className="tags-section">
          <Title level={3} className="section-title">
            热门标签
          </Title>
          <Space wrap>
            {[
              'photorealistic', 'cinematic', 'octane render', 'hyperdetailed',
              'portrait', 'landscape', 'abstract art', 'character design',
              'digital art', 'concept art', '4K', '8K', 'ultra wide'
            ].map(tag => (
              <Tag key={tag} className="popular-tag" color="purple">
                {tag}
              </Tag>
            ))}
          </Space>
        </div>

        {/* 感谢信息 */}
        <div className="thanks-section">
          <Card className="thanks-card">
            <div className="thanks-content">
              <HeartOutlined className="thanks-icon" />
              <Title level={4}>感谢你的使用</Title>
              <Text type="secondary">
                让我们一起探索AI绘画的无限可能，创造更多精彩作品！
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
