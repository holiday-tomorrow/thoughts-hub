const express = require('express');
const router = express.Router();
const { 
  getTags, 
  getTag, 
  createTag, 
  updateTag, 
  deleteTag 
} = require('../controllers/tag.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// 公开路由
router.get('/', getTags);
router.get('/:id', getTag);

// 需要登录和管理员权限的路由
router.post('/', protect, authorize('admin'), createTag);
router.put('/:id', protect, authorize('admin'), updateTag);
router.delete('/:id', protect, authorize('admin'), deleteTag);

module.exports = router;