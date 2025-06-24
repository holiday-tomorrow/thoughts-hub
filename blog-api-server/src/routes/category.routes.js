const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// 公开路由
router.get('/', getCategories);

// 带参数的路由
router.get('/:id', getCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

// 需要登录和管理员权限的路由
router.post('/', protect, authorize('admin'), createCategory);

module.exports = router;