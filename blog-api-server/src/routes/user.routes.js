const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, updateAvatar } = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// 需要管理员权限的路由
router.route('/')
  .get(protect, authorize('admin'), getUsers);

// 管理员操作特定用户的路由
router.route('/:id')
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

// 用户个人资料路由
router.route('/profile')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

// 更新头像
router.put('/avatar', protect, updateAvatar);

module.exports = router;