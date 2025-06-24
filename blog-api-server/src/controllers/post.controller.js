const Post = require('../models/post.model');
const Category = require('../models/category.model');
const Tag = require('../models/tag.model');

// @desc    获取所有文章（分页、过滤、排序）
// @route   GET /api/posts
// @access  公开
exports.getPosts = async (req, res, next) => {
  try {
    // 查询参数
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const status = req.query.status || 'published';
    
    // 构建查询条件
    const query = { status };
    
    // 执行查询
    const total = await Post.countDocuments(query);
    
    // 获取文章列表（按置顶和发布时间排序）
    const posts = await Post.find(query)
      .sort({ isSticky: -1, publishedAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    // 分页信息
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    // 添加分页导航
    if (startIndex > 0) {
      pagination.prev = page - 1;
    }
    
    if (startIndex + limit < total) {
      pagination.next = page + 1;
    }
    
    res.status(200).json({
      success: true,
      pagination,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取单篇文章
// @route   GET /api/posts/:id
// @access  公开
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: '找不到该文章'
      });
    }
    
    // 如果是草稿，只有作者可以查看
    if (post.status === 'draft' && post.author._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '无权访问该草稿'
      });
    }
    
    // 增加浏览次数
    post.viewCount += 1;
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    创建文章
// @route   POST /api/posts
// @access  私有
exports.createPost = async (req, res, next) => {
  try {
    // 添加作者信息
    req.body.author = req.user.id;
    
    // 处理分类
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: '分类不存在'
        });
      }
    }
    
    // 处理标签
    if (req.body.tags && req.body.tags.length > 0) {
      const tagIds = req.body.tags;
      const validTags = await Tag.find({ _id: { $in: tagIds } });
      
      if (validTags.length !== tagIds.length) {
        return res.status(400).json({
          success: false,
          error: '一个或多个标签不存在'
        });
      }
      
      req.body.tags = validTags.map(tag => tag._id);
    }
    
    // 创建文章
    const post = await Post.create(req.body);
    
    // 如果是已发布状态，设置发布时间
    if (post.status === 'published' && !post.publishedAt) {
      post.publishedAt = Date.now();
      await post.save();
    }
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新文章
// @route   PUT /api/posts/:id
// @access  私有
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: '找不到该文章'
      });
    }
    
    // 确保用户是文章作者或管理员
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权修改该文章'
      });
    }
    
    // 处理分类
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: '分类不存在'
        });
      }
    }
    
    // 处理标签
    if (req.body.tags && req.body.tags.length > 0) {
      const tagIds = req.body.tags;
      const validTags = await Tag.find({ _id: { $in: tagIds } });
      
      if (validTags.length !== tagIds.length) {
        return res.status(400).json({
          success: false,
          error: '一个或多个标签不存在'
        });
      }
      
      req.body.tags = validTags.map(tag => tag._id);
    }
    
    // 如果状态从草稿变为已发布，设置发布时间
    if (post.status === 'draft' && req.body.status === 'published') {
      req.body.publishedAt = Date.now();
    }
    
    // 更新文章
    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    删除文章
// @route   DELETE /api/posts/:id
// @access  私有
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: '找不到该文章'
      });
    }
    
    // 确保用户是文章作者或管理员
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权删除该文章'
      });
    }
    
    await post.deleteOne();
    
    res.status(200).json({
      success: true,
      message: '文章已成功删除'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    保存草稿
// @route   POST /api/posts/draft
// @access  私有
exports.saveDraft = async (req, res, next) => {
  try {
    // 添加作者信息和草稿状态
    req.body.author = req.user.id;
    req.body.status = 'draft';
    
    // 检查是否已有草稿ID
    let draft;
    if (req.body._id) {
      // 更新现有草稿
      draft = await Post.findOne({ 
        _id: req.body._id, 
        author: req.user.id,
        status: 'draft'
      });
      
      if (draft) {
        // 更新草稿
        draft = await Post.findByIdAndUpdate(draft._id, req.body, {
          new: true,
          runValidators: true
        });
      } else {
        // 创建新草稿
        draft = await Post.create(req.body);
      }
    } else {
      // 创建新草稿
      draft = await Post.create(req.body);
    }
    
    res.status(200).json({
      success: true,
      data: draft,
      message: '草稿已保存'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    切换文章置顶状态
// @route   PUT /api/posts/:id/sticky
// @access  私有/管理员
exports.toggleSticky = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: '找不到该文章'
      });
    }
    
    // 只有已发布的文章可以置顶
    if (post.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: '只有已发布的文章可以置顶'
      });
    }
    
    // 切换置顶状态
    post.isSticky = !post.isSticky;
    await post.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: post._id,
        isSticky: post.isSticky
      },
      message: post.isSticky ? '文章已置顶' : '文章已取消置顶'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    按分类获取文章
// @route   GET /api/posts/category/:categoryId
// @access  公开
exports.getPostsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // 验证分类是否存在
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '分类不存在'
      });
    }
    
    // 查询该分类下的已发布文章
    const query = { category: categoryId, status: 'published' };
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .sort({ isSticky: -1, publishedAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    // 分页信息
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    if (startIndex > 0) {
      pagination.prev = page - 1;
    }
    
    if (startIndex + limit < total) {
      pagination.next = page + 1;
    }
    
    res.status(200).json({
      success: true,
      pagination,
      category,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    按标签获取文章
// @route   GET /api/posts/tag/:tagId
// @access  公开
exports.getPostsByTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // 验证标签是否存在
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: '标签不存在'
      });
    }
    
    // 查询包含该标签的已发布文章
    const query = { tags: tagId, status: 'published' };
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .sort({ isSticky: -1, publishedAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    // 分页信息
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    if (startIndex > 0) {
      pagination.prev = page - 1;
    }
    
    if (startIndex + limit < total) {
      pagination.next = page + 1;
    }
    
    res.status(200).json({
      success: true,
      pagination,
      tag,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    按作者获取文章
// @route   GET /api/posts/author/:userId
// @access  公开
exports.getPostsByAuthor = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // 查询该作者的已发布文章
    const query = { author: userId, status: 'published' };
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .sort({ isSticky: -1, publishedAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    // 分页信息
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    if (startIndex > 0) {
      pagination.prev = page - 1;
    }
    
    if (startIndex + limit < total) {
      pagination.next = page + 1;
    }
    
    res.status(200).json({
      success: true,
      pagination,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    搜索文章
// @route   GET /api/posts/search
// @access  公开
exports.searchPosts = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: '请提供搜索关键词'
      });
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // 构建搜索查询
    const query = {
      $and: [
        { status: 'published' },
        { $text: { $search: q } }
      ]
    };
    
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(startIndex)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');
    
    // 分页信息
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    if (startIndex > 0) {
      pagination.prev = page - 1;
    }
    
    if (startIndex + limit < total) {
      pagination.next = page + 1;
    }
    
    res.status(200).json({
      success: true,
      pagination,
      query: q,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取时间轴文章列表
// @route   GET /api/posts/timeline
// @access  公开
exports.getTimelinePosts = async (req, res, next) => {
  try {
    // 按年月分组获取文章
    const timeline = await Post.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: {
            year: { $year: '$publishedAt' },
            month: { $month: '$publishedAt' }
          },
          posts: {
            $push: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              publishedAt: '$publishedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    
    // 重新格式化结果
    const formattedTimeline = timeline.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
      posts: item.posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    }));
    
    res.status(200).json({
      success: true,
      data: formattedTimeline
    });
  } catch (error) {
    next(error);
  }
};