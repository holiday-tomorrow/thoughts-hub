const mongoose = require('mongoose');
const slugify = require('slugify');
const marked = require('marked');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供文章标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, '请提供文章内容']
  },
  contentHtml: {
    type: String
  },
  excerpt: {
    type: String,
    maxlength: [200, '摘要不能超过200个字符']
  },
  coverImage: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'draft'
  },
  isSticky: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  lastSavedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 创建文章slug（用于URL友好的标识）
PostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true
    });
    
    // 添加随机字符串确保唯一性
    if (this.isNew) {
      this.slug += '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
    }
  }
  
  // 将Markdown内容转换为HTML
  if (this.isModified('content')) {
    this.contentHtml = marked.parse(this.content);
    
    // 如果没有提供摘要，则自动生成
    if (!this.excerpt) {
      // 移除HTML标签并截取前200个字符作为摘要
      const plainText = this.content.replace(/<[^>]*>/g, '');
      this.excerpt = plainText.substring(0, 200);
    }
    
    // 更新最后保存时间
    this.lastSavedAt = Date.now();
  }
  
  // 如果状态从草稿变为已发布，设置发布时间
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// 虚拟字段：评论（不存储在数据库中）
PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

// 索引以提高查询性能
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ slug: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ isSticky: 1, publishedAt: -1 });

module.exports = mongoose.model('Post', PostSchema);