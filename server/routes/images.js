const express = require('express');
const router = express.Router();
const Image = require('../models/Image');

// 获取所有图片
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const images = await Image.find({ isPublic: true })
      .populate('prompt', 'originalText translatedText')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Image.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: {
        images,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取图片失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取单个图片
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('prompt', 'originalText translatedText')
      .select('-__v');
    
    if (!image) {
      return res.status(404).json({ error: '图片不存在' });
    }

    res.json({
      success: true,
      data: image
    });

  } catch (error) {
    console.error('获取图片失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 第一阶段暂不实现图片上传功能，将在第二阶段添加
// 这里预留接口结构

module.exports = router;
