const express = require('express');
const router = express.Router();
const { 
  getPosts, 
  getPost, 
  createPost, 
  updatePost, 
  deletePost, 
  saveDraft, 
  toggleSticky,
  getPostsByCategory,
  getPostsByTag,
  getPostsByAuthor,
  searchPosts,
  getTimelinePosts
} = require('../controllers/post.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// 公开路由
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/timeline', getTimelinePosts);
router.get('/category/:categoryId', getPostsByCategory);
router.get('/tag/:tagId', getPostsByTag);
router.get('/author/:userId', getPostsByAuthor);

// 获取单篇文章需要验证用户身份，以便草稿只能被作者查看
router.get('/:id', protect, getPost);

// 需要登录的路由
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/draft', protect, saveDraft);
router.put('/:id/sticky', protect, authorize('admin'), toggleSticky);

module.exports = router;