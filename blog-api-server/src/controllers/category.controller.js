const Category = require('../models/category.model');
const Post = require('../models/post.model');
const slugify = require('slugify');

// @desc    获取所有分类
// @route   GET /api/categories
// @access  公开
exports.getCategories = async (req, res, next) => {
  try {
    // 获取所有分类，并填充文章计数
    const categories = await Category.find()
      .populate('createdBy', 'username')
      .populate('postCount');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取单个分类
// @route   GET /api/categories/:id
// @access  公开
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('postCount')
      .populate('childCategories');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '找不到该分类'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    创建分类
// @route   POST /api/categories
// @access  私有/管理员
exports.createCategory = async (req, res, next) => {
  try {
    // 添加创建者信息
    req.body.createdBy = req.user.id;
    
    // 检查父分类是否存在
    if (req.body.parentCategory) {
      const parentCategory = await Category.findById(req.body.parentCategory);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: '父分类不存在'
        });
      }
    }
    
    // 如果提供了name但没有提供slug，则自动生成slug
    if (req.body.name && !req.body.slug) {
      req.body.slug = slugify(req.body.name, {
        lower: true,
        strict: true
      });
    }
    
    // 创建分类
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    // 处理重复名称错误
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '该分类名称已存在'
      });
    }
    next(error);
  }
};

// @desc    更新分类
// @route   PUT /api/categories/:id
// @access  私有/管理员
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '找不到该分类'
      });
    }
    
    // 检查父分类是否存在
    if (req.body.parentCategory) {
      // 不能将自己设为父分类
      if (req.body.parentCategory === req.params.id) {
        return res.status(400).json({
          success: false,
          error: '不能将分类自身设为父分类'
        });
      }
      
      const parentCategory = await Category.findById(req.body.parentCategory);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: '父分类不存在'
        });
      }
    }
    
    // 更新分类
    // 如果没有提供slug但修改了name，则自动生成slug
    if (!req.body.slug && req.body.name && req.body.name !== category.name) {
      req.body.slug = slugify(req.body.name, {
        lower: true,
        strict: true
      });
    }
    
    category = await Category.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    // 处理重复名称错误
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '该分类名称已存在'
      });
    }
    next(error);
  }
};

// @desc    删除分类
// @route   DELETE /api/categories/:id
// @access  私有/管理员
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '找不到该分类'
      });
    }
    
    // 检查是否有文章使用该分类
    const postsCount = await Post.countDocuments({ category: req.params.id });
    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `该分类下有${postsCount}篇文章，无法删除`
      });
    }
    
    // 检查是否有子分类
    const childCategoriesCount = await Category.countDocuments({ parentCategory: req.params.id });
    if (childCategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `该分类下有${childCategoriesCount}个子分类，无法删除`
      });
    }
    
    // 硬删除分类
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: '分类已成功删除'
    });
  } catch (error) {
    next(error);
  }
};