import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Select, 
  Input, 
  Tag, 
  Popconfirm,
  message,
  Modal,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  HistoryOutlined, 
  CopyOutlined, 
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  TranslationOutlined
} from '@ant-design/icons';
import { translateAPI } from '../services/api';
import './History.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // 语言标签映射
  const languageMap = {
    'zh-CN': { label: '中文', color: 'red' },
    'en-US': { label: 'English', color: 'blue' },
    'ja-JP': { label: '日本語', color: 'orange' },
    'ko-KR': { label: '한국어', color: 'green' }
  };

  // 分类映射
  const categoryMap = {
    general: '通用',
    portrait: '人像',
    landscape: '风景',
    abstract: '抽象',
    character: '角色',
    scene: '场景',
    style: '风格',
    other: '其他'
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        category: filters.category !== 'all' ? filters.category : undefined,
        search: filters.search || undefined
      };

      const response = await translateAPI.getHistory(params);
      
      if (response.data.success) {
        setHistoryData(response.data.data.prompts);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total
        }));
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
      message.error('获取历史记录失败');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters.category]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动复制');
    }
  };

  const handleDelete = async (id) => {
    try {
      await translateAPI.deleteTranslation(id);
      message.success('删除成功');
      fetchHistory();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value) => {
    setFilters(prev => ({ ...prev, category: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: '原文',
      dataIndex: 'originalText',
      key: 'originalText',
      ellipsis: true,
      width: '30%',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>
          {text}
        </Text>
      )
    },
    {
      title: '译文',
      dataIndex: 'translatedText',
      key: 'translatedText',
      ellipsis: true,
      width: '30%',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>
          {text}
        </Text>
      )
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: '10%',
      render: (language) => {
        const langInfo = languageMap[language] || { label: language, color: 'default' };
        return <Tag color={langInfo.color}>{langInfo.label}</Tag>;
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: '10%',
      render: (category) => (
        <Tag color="purple">{categoryMap[category] || category}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="查看详情"
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleCopyToClipboard(record.translatedText)}
            title="复制译文"
          />
          <Popconfirm
            title="确认删除这条记录吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="删除记录"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <Title level={2} className="page-title">
            <HistoryOutlined className="page-icon" />
            翻译历史
          </Title>
          <Text type="secondary" className="page-description">
            查看和管理你的翻译记录
          </Text>
        </div>

        {/* 统计信息 */}
        <Row gutter={16} className="stats-row">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总翻译次数"
                value={pagination.total}
                prefix={<TranslationOutlined />}
                valueStyle={{ color: '#667eea' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="本页记录"
                value={historyData.length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="当前页"
                value={`${pagination.current}/${Math.ceil(pagination.total / pagination.pageSize)}`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 筛选控件 */}
        <Card className="filter-card">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">分类筛选</Text>
                <Select
                  value={filters.category}
                  onChange={handleCategoryChange}
                  style={{ width: '100%' }}
                >
                  <Option value="all">全部分类</Option>
                  {Object.entries(categoryMap).map(([key, label]) => (
                    <Option key={key} value={key}>{label}</Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={16} md={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">搜索内容</Text>
                <Search
                  placeholder="搜索原文或译文..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Space>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Space style={{ marginTop: 20 }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchHistory}
                  loading={loading}
                >
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 数据表格 */}
        <Card>
          <Table
            columns={columns}
            dataSource={historyData}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
            }}
            onChange={handleTableChange}
            rowKey="_id"
            scroll={{ x: 800 }}
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="翻译记录详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button 
              key="copy-original" 
              onClick={() => handleCopyToClipboard(selectedRecord?.originalText)}
            >
              复制原文
            </Button>,
            <Button 
              key="copy-translated" 
              type="primary"
              onClick={() => handleCopyToClipboard(selectedRecord?.translatedText)}
            >
              复制译文
            </Button>,
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          {selectedRecord && (
            <div className="detail-content">
              <div className="detail-section">
                <Title level={5}>原文</Title>
                <Paragraph copyable className="detail-text">
                  {selectedRecord.originalText}
                </Paragraph>
              </div>
              
              <div className="detail-section">
                <Title level={5}>译文</Title>
                <Paragraph copyable className="detail-text">
                  {selectedRecord.translatedText}
                </Paragraph>
              </div>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary">目标语言：</Text>
                  <Tag color={languageMap[selectedRecord.language]?.color}>
                    {languageMap[selectedRecord.language]?.label}
                  </Tag>
                </Col>
                <Col span={8}>
                  <Text type="secondary">分类：</Text>
                  <Tag color="purple">{categoryMap[selectedRecord.category]}</Tag>
                </Col>
                <Col span={8}>
                  <Text type="secondary">创建时间：</Text>
                  <Text>{new Date(selectedRecord.createdAt).toLocaleString('zh-CN')}</Text>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default History;
