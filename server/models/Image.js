const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt'
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
imageSchema.index({ createdAt: -1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ prompt: 1 });

module.exports = mongoose.model('Image', imageSchema);
