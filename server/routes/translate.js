const express = require('express');
const router = express.Router();
const translateService = require('../services/translateService');
const Prompt = require('../models/Prompt');

// 内存存储 - 最多保存10条翻译记录
let translationHistory = [];

// 翻译单个提示词
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage = 'zh-CN', saveToDatabase = false } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '翻译文本不能为空' });
    }

    // 调用翻译服务
    const translation = await translateService.translatePrompt(text, targetLanguage);

    // 保存到内存存储（最多10条）
    if (saveToDatabase && translation.translated) {
      try {
        const newRecord = {
          id: Date.now().toString(),
          originalText: translation.original,
          translatedText: translation.translated,
          language: 'chinese',
          category: 'general',
          createdAt: new Date()
        };
        
        // 添加到数组开头
        translationHistory.unshift(newRecord);
        
        // 只保留最新的10条记录
        if (translationHistory.length > 10) {
          translationHistory = translationHistory.slice(0, 10);
        }
        
        translation.saved = true;
        translation.promptId = newRecord.id;
        translation.message = `已保存，当前共${translationHistory.length}条记录`;
      } catch (saveError) {
        console.error('保存提示词失败:', saveError);
        translation.saved = false;
      }
    }

    res.json({
      success: true,
      data: translation
    });

  } catch (error) {
    console.error('翻译失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 词组分析API（独立的，用于已翻译的文本）
router.post('/analyze-phrases', async (req, res) => {
  try {
    const { original, translated, targetLanguage = 'zh-CN' } = req.body;

    if (!original || original.trim().length === 0) {
      return res.status(400).json({ error: '原文不能为空' });
    }

    if (!translated || translated.trim().length === 0) {
      return res.status(400).json({ error: '译文不能为空' });
    }

    console.log('开始分析词组对应关系:', { original, translated });

    // 调用词组分析服务
    const analysis = await translateService.analyzePhrases(original, translated, targetLanguage);

    console.log('词组分析结果:', {
      keyPhrasesCount: analysis.keyPhrases?.length || 0
    });

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('词组分析失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 交互式翻译（带词组对应关系）- 保留作为备用
router.post('/interactive', async (req, res) => {
  try {
    const { text, targetLanguage = 'zh-CN', saveToDatabase = false } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '翻译文本不能为空' });
    }

    console.log('开始交互式翻译:', text);

    // 调用交互式翻译服务
    const translation = await translateService.translateWithPhrases(text, targetLanguage);

    console.log('交互式翻译结果:', {
      original: translation.original,
      translated: translation.translated,
      keyPhrasesCount: translation.keyPhrases?.length || 0
    });

    // 如果用户选择保存到数据库
    if (saveToDatabase && translation.translated) {
      try {
        const prompt = new Prompt({
          originalText: translation.original,
          translatedText: translation.translated,
          language: translation.language,
          category: 'interactive'
        });
        await prompt.save();
        translation.saved = true;
        translation.promptId = prompt._id;
      } catch (saveError) {
        console.error('保存交互式翻译失败:', saveError);
        translation.saved = false;
      }
    }

    res.json({
      success: true,
      data: translation
    });

  } catch (error) {
    console.error('交互式翻译失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 批量翻译
router.post('/batch', async (req, res) => {
  try {
    const { texts, targetLanguage = 'zh-CN' } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: '请提供要翻译的文本数组' });
    }

    if (texts.length > 10) {
      return res.status(400).json({ error: '批量翻译最多支持10个文本' });
    }

    const translations = await translateService.translateBatch(texts, targetLanguage);

    res.json({
      success: true,
      data: translations
    });

  } catch (error) {
    console.error('批量翻译失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取翻译历史（从内存存储）
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    
    // 筛选分类
    let filteredHistory = translationHistory;
    if (category && category !== 'all') {
      filteredHistory = translationHistory.filter(item => item.category === category);
    }
    
    // 分页处理
    const skip = (page - 1) * limit;
    const paginatedHistory = filteredHistory.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        prompts: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredHistory.length,
          pages: Math.ceil(filteredHistory.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取翻译历史失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 搜索提示词（在内存存储中搜索）
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }

    // 在内存中搜索（简单的包含匹配）
    const searchTerm = q.toLowerCase();
    const searchResults = translationHistory.filter(item => 
      item.originalText.toLowerCase().includes(searchTerm) ||
      item.translatedText.toLowerCase().includes(searchTerm)
    );

    // 分页处理
    const skip = (page - 1) * limit;
    const paginatedResults = searchResults.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        prompts: paginatedResults,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: searchResults.length,
          pages: Math.ceil(searchResults.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('搜索提示词失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
