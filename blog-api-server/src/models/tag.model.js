const mongoose = require('mongoose');
const slugify = require('slugify');

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供标签名称'],
    unique: true,
    trim: true,
    maxlength: [20, '标签名称不能超过20个字符']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: [200, '标签描述不能超过200个字符']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 创建标签slug（用于URL友好的标识）
TagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true
    });
  }
  next();
});

// 虚拟字段：使用该标签的文章数量
TagSchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'tags',
  count: true
});

module.exports = mongoose.model('Tag', TagSchema);