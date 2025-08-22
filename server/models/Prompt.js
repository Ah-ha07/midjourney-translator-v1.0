const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true,
    trim: true
  },
  translatedText: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    default: 'chinese'  // 改为MongoDB文本索引支持的语言代码
    // 支持的语言: danish, dutch, english, finnish, french, german, hungarian, italian, norwegian, portuguese, romanian, russian, spanish, swedish, turkish, chinese
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'portrait', 'landscape', 'abstract', 'character', 'scene', 'style', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
promptSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 索引
promptSchema.index({ originalText: 'text', translatedText: 'text' });
promptSchema.index({ category: 1, createdAt: -1 });
promptSchema.index({ usageCount: -1 });

module.exports = mongoose.model('Prompt', promptSchema);
