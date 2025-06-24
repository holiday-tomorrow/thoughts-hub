const Tag = require('../models/tag.model');
const Post = require('../models/post.model');

// @desc    获取所有标签
// @route   GET /api/tags
// @access  公开
exports.getTags = async (req, res, next) => {
  try {
    // 获取所有标签，并填充文章计数
    const tags = await Tag.find()
      .populate('createdBy', 'username')
      .populate('postCount');
    
    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取单个标签
// @route   GET /api/tags/:id
// @access  公开
exports.getTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('postCount');
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: '找不到该标签'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    创建标签
// @route   POST /api/tags
// @access  私有/管理员
exports.createTag = async (req, res, next) => {
  try {
    // 添加创建者信息
    req.body.createdBy = req.user.id;
    
    // 创建标签
    const tag = await Tag.create(req.body);
    
    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    // 处理重复名称错误
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '该标签名称已存在'
      });
    }
    next(error);
  }
};

// @desc    更新标签
// @route   PUT /api/tags/:id
// @access  私有/管理员
exports.updateTag = async (req, res, next) => {
  try {
    let tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: '找不到该标签'
      });
    }
    
    // 更新标签
    tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    // 处理重复名称错误
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '该标签名称已存在'
      });
    }
    next(error);
  }
};

// @desc    删除标签
// @route   DELETE /api/tags/:id
// @access  私有/管理员
exports.deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: '找不到该标签'
      });
    }
    
    // 检查是否有文章使用该标签
    const postsCount = await Post.countDocuments({ tags: req.params.id });
    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `该标签被${postsCount}篇文章使用，无法删除`
      });
    }
    
    await tag.deleteOne();
    
    res.status(200).json({
      success: true,
      message: '标签已成功删除'
    });
  } catch (error) {
    next(error);
  }
};