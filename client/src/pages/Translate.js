import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Row, 
  Col, 
  Space, 
  Typography, 
  Select, 
  Switch, 
  message, 
  Divider,
  Alert
} from 'antd';
import { 
  TranslationOutlined, 
  CopyOutlined, 
  SwapOutlined,
  SaveOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { translateAPI } from '../services/api';
import './Translate.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const Translate = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('zh-CN');
  const [loading, setLoading] = useState(false);
  const [saveToDatabase, setSaveToDatabase] = useState(false);
  
  // 词组分析相关状态
  const [keyPhrases, setKeyPhrases] = useState([]);
  const [analyzingPhrases, setAnalyzingPhrases] = useState(false);
  const [showPhraseAnalysis, setShowPhraseAnalysis] = useState(false);
  const [hoveredPhraseId, setHoveredPhraseId] = useState(null);

  const languageOptions = [
    { value: 'zh-CN', label: '中文', flag: '🇨🇳' },
    { value: 'en-US', label: 'English', flag: '🇺🇸' },
    { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { value: 'ko-KR', label: '한국어', flag: '🇰🇷' }
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      message.warning('请输入要翻译的文本');
      return;
    }

    setLoading(true);
    // 清除之前的词组分析结果
    setKeyPhrases([]);
    setShowPhraseAnalysis(false);
    setHoveredPhraseId(null);
    
    try {
      const response = await translateAPI.translate({
        text: inputText,
        targetLanguage: targetLanguage,
        saveToDatabase: saveToDatabase
      });

      if (response.data.success) {
        setTranslatedText(response.data.data.translated);
        message.success('翻译完成！');
        
        if (saveToDatabase && response.data.data.saved) {
          message.success('翻译结果已保存到历史记录');
        }
      } else {
        message.error('翻译失败，请重试');
      }
    } catch (error) {
      console.error('翻译错误:', error);
      message.error(error.response?.data?.error || '翻译服务异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
      // 简单的语言切换逻辑
      const newLanguage = targetLanguage === 'zh-CN' ? 'en-US' : 'zh-CN';
      setTargetLanguage(newLanguage);
    }
  };

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动复制');
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setKeyPhrases([]);
    setShowPhraseAnalysis(false);
    setHoveredPhraseId(null);
  };

  // 词组分析函数
  const handleAnalyzePhrases = async () => {
    if (!inputText.trim() || !translatedText.trim()) {
      message.warning('请先完成翻译');
      return;
    }

    setAnalyzingPhrases(true);
    try {
      const response = await translateAPI.analyzePhrases({
        original: inputText,
        translated: translatedText,
        targetLanguage: targetLanguage
      });

      if (response.data.success) {
        setKeyPhrases(response.data.data.keyPhrases || []);
        setShowPhraseAnalysis(true);
        message.success('词组分析完成！');
      } else {
        message.error('词组分析失败，请重试');
      }
    } catch (error) {
      console.error('词组分析错误:', error);
      message.error(error.response?.data?.error || '词组分析服务异常，请稍后重试');
    } finally {
      setAnalyzingPhrases(false);
    }
  };

  // 渲染带高亮的文本
  const renderHighlightedText = (text, phrases, isOriginal = true) => {
    if (!phrases || phrases.length === 0) {
      return <span>{text}</span>;
    }

    let highlightedText = text;
    let offset = 0;

    phrases.forEach((phrase) => {
      const start = isOriginal ? phrase.enStart : phrase.zhStart;
      const end = isOriginal ? phrase.enEnd : phrase.zhEnd;
      const phraseText = isOriginal ? phrase.en : phrase.zh;
      
      if (start !== undefined && end !== undefined) {
        const adjustedStart = start + offset;
        const adjustedEnd = end + offset;
        
        const before = highlightedText.substring(0, adjustedStart);
        const after = highlightedText.substring(adjustedEnd);
        
        const highlightClass = hoveredPhraseId === phrase.id ? 'phrase-highlight active' : 'phrase-highlight';
        
        const highlightedPhrase = `<span class="${highlightClass}" data-phrase-id="${phrase.id}">${phraseText}</span>`;
        
        highlightedText = before + highlightedPhrase + after;
        offset += highlightedPhrase.length - phraseText.length;
      }
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const getCurrentLanguageFlag = () => {
    const current = languageOptions.find(lang => lang.value === targetLanguage);
    return current ? current.flag : '🌐';
  };

  return (
    <div className="translate-page">
      <div className="translate-container">
        <div className="translate-header">
          <Title level={2} className="page-title">
            <TranslationOutlined className="page-icon" />
            智能翻译
          </Title>
          <Text type="secondary" className="page-description">
            使用DeepSeek AI技术，精准翻译Midjourney提示词
          </Text>
        </div>

        <Card className="translate-card">
          <Row gutter={24}>
            {/* 输入区域 */}
            <Col xs={24} lg={12}>
              <div className="input-section">
                <div className="section-header">
                  <Text strong>原文</Text>
                  <Space>
                    <Button 
                      type="text" 
                      icon={<ClearOutlined />} 
                      onClick={handleClear}
                      disabled={!inputText && !translatedText}
                    >
                      清空
                    </Button>
                  </Space>
                </div>
                {showPhraseAnalysis ? (
                  <div className="phrase-analysis-input">
                    <div 
                      className="highlighted-text"
                      onMouseLeave={() => setHoveredPhraseId(null)}
                      onClick={(e) => {
                        const phraseId = e.target.getAttribute('data-phrase-id');
                        if (phraseId) {
                          setHoveredPhraseId(parseInt(phraseId));
                        }
                      }}
                      onMouseOver={(e) => {
                        const phraseId = e.target.getAttribute('data-phrase-id');
                        if (phraseId) {
                          setHoveredPhraseId(parseInt(phraseId));
                        }
                      }}
                    >
                      {renderHighlightedText(inputText, keyPhrases, true)}
                    </div>
                  </div>
                ) : (
                  <TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="请输入要翻译的Midjourney提示词..."
                    rows={10}
                    maxLength={2000}
                    showCount
                    className="translate-input"
                  />
                )}
              </div>
            </Col>

            {/* 翻译控制区域 */}
            <Col xs={24} lg={12}>
              <div className="output-section">
                <div className="section-header">
                  <Text strong>译文 {getCurrentLanguageFlag()}</Text>
                  <Space>
                    {translatedText && (
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => handleCopyToClipboard(translatedText)}
                      >
                        复制
                      </Button>
                    )}
                  </Space>
                </div>
                {showPhraseAnalysis ? (
                  <div className="phrase-analysis-output">
                    <div 
                      className="highlighted-text"
                      onMouseLeave={() => setHoveredPhraseId(null)}
                      onClick={(e) => {
                        const phraseId = e.target.getAttribute('data-phrase-id');
                        if (phraseId) {
                          setHoveredPhraseId(parseInt(phraseId));
                        }
                      }}
                      onMouseOver={(e) => {
                        const phraseId = e.target.getAttribute('data-phrase-id');
                        if (phraseId) {
                          setHoveredPhraseId(parseInt(phraseId));
                        }
                      }}
                    >
                      {renderHighlightedText(translatedText, keyPhrases, false)}
                    </div>
                  </div>
                ) : (
                  <TextArea
                    value={translatedText}
                    placeholder="翻译结果将在这里显示..."
                    rows={10}
                    readOnly
                    className="translate-output"
                  />
                )}
                
                {/* 词组分析按钮 */}
                {translatedText && !showPhraseAnalysis && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <Button 
                      type="dashed"
                      icon={<span>🔍</span>}
                      onClick={handleAnalyzePhrases}
                      loading={analyzingPhrases}
                      style={{ borderStyle: 'dashed', borderColor: '#1890ff' }}
                    >
                      {analyzingPhrases ? '正在分析词组对应关系...' : '🎯 分析词组对应关系'}
                    </Button>
                  </div>
                )}
                
                {/* 词组对应说明 */}
                {showPhraseAnalysis && keyPhrases.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      💡 鼠标悬停在词组上查看对应关系
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Divider />

          {/* 控制面板 */}
          <div className="control-panel">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text type="secondary">目标语言</Text>
                  <Select
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    {languageOptions.map(lang => (
                      <Option key={lang.value} value={lang.value}>
                        {lang.flag} {lang.label}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>

              <Col xs={24} sm={8} md={6}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">保存到历史</Text>
                  <Switch
                    checked={saveToDatabase}
                    onChange={setSaveToDatabase}
                    checkedChildren={<SaveOutlined />}
                    unCheckedChildren="不保存"
                  />
                </Space>
              </Col>

              <Col xs={24} sm={8} md={12}>
                <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    type="default"
                    icon={<SwapOutlined />}
                    onClick={handleSwapLanguages}
                    disabled={!translatedText}
                  >
                    交换语言
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<TranslationOutlined />}
                    onClick={handleTranslate}
                    loading={loading}
                    disabled={!inputText.trim()}
                  >
                    开始翻译
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        </Card>

        {/* 使用提示 */}
        <Card className="tips-card">
          <Alert
            message="翻译小贴士"
            description={
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>支持中英日韩四种语言互译</li>
                <li>专门优化了Midjourney提示词的翻译准确性</li>
                <li>保留专业术语，如 photorealistic、cinematic 等</li>
                <li>开启"保存到历史"可以查看翻译记录</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Card>
      </div>
    </div>
  );
};

export default Translate;
