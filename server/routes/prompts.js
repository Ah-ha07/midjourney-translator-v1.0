const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// 获取所有提示词
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    
    // 如果有搜索关键词
    if (req.query.search) {
      query.$or = [
        { originalText: { $regex: req.query.search, $options: 'i' } },
        { translatedText: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 如果有分类筛选
    if (req.query.category) {
      query.category = req.query.category;
    }

    const prompts = await Prompt.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Prompt.countDocuments(query);

    res.json({
      success: true,
      data: {
        prompts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取提示词失败:', error);
    res.status(500).json({
      success: false,
      error: '获取提示词失败'
    });
  }
});

// 获取单个提示词
router.get('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: '提示词不存在'
      });
    }

    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    console.error('获取提示词失败:', error);
    res.status(500).json({
      success: false,
      error: '获取提示词失败'
    });
  }
});

// 更新提示词
router.put('/:id', async (req, res) => {
  try {
    const { category, tags, notes } = req.body;
    
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { 
        category,
        tags,
        notes,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: '提示词不存在'
      });
    }

    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    console.error('更新提示词失败:', error);
    res.status(500).json({
      success: false,
      error: '更新提示词失败'
    });
  }
});

// 删除提示词
router.delete('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndDelete(req.params.id);
    
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: '提示词不存在'
      });
    }

    res.json({
      success: true,
      message: '提示词删除成功'
    });
  } catch (error) {
    console.error('删除提示词失败:', error);
    res.status(500).json({
      success: false,
      error: '删除提示词失败'
    });
  }
});

// 增加使用次数
router.post('/:id/use', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      },
      { new: true }
    );

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: '提示词不存在'
      });
    }

    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    console.error('更新使用次数失败:', error);
    res.status(500).json({
      success: false,
      error: '更新使用次数失败'
    });
  }
});

module.exports = router;
