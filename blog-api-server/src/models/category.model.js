const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供分类名称'],
    trim: true,
    maxlength: [30, '分类名称不能超过30个字符'],
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, '分类描述不能超过500个字符']
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
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

// 创建分类slug（用于URL友好的标识）
CategorySchema.pre('save', function(next) {
  // 如果没有提供slug且修改了name，则根据name生成slug
  if (!this.slug && this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true
    });
  }
  next();
});

// 虚拟字段：该分类下的文章数量
CategorySchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// 虚拟字段：子分类
CategorySchema.virtual('childCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

module.exports = mongoose.model('Category', CategorySchema);