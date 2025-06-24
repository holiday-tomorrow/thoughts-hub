const User = require('../models/user.model');

// @desc    获取所有用户（仅管理员）
// @route   GET /api/users
// @access  私有/管理员
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取当前用户资料
// @route   GET /api/users/profile
// @access  私有
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新用户资料
// @route   PUT /api/users/profile 或 PUT /api/users/:id (管理员)
// @access  私有
exports.updateUser = async (req, res, next) => {
  try {
    // 可更新的字段
    const fieldsToUpdate = {
      username: req.body.username,
      email: req.body.email,
      bio: req.body.bio
    };
    
    // 如果是管理员且更新其他用户，可以更新角色
    if (req.params.id && req.user.role === 'admin') {
      fieldsToUpdate.role = req.body.role;
    }
    
    // 移除未提供的字段
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });
    
    // 确定要更新的用户ID
    const userId = req.params.id || req.user.id;
    
    // 更新用户资料
    const user = await User.findByIdAndUpdate(
      userId,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '未找到用户'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: '用户资料更新成功'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    删除用户
// @route   DELETE /api/users/profile 或 DELETE /api/users/:id (管理员)
// @access  私有
exports.deleteUser = async (req, res, next) => {
  try {
    // 确定要删除的用户ID
    const userId = req.params.id || req.user.id;
    
    // 如果是管理员删除其他用户，需要检查目标用户是否也是管理员
    if (req.params.id && req.user.role === 'admin') {
      const targetUser = await User.findById(req.params.id);
      
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: '未找到用户'
        });
      }
      
      // 不允许删除其他管理员账户
      if (targetUser.role === 'admin') {
        return res.status(403).json({
          success: false,
          error: '不能删除管理员账户'
        });
      }
    }
    
    // 查找并删除用户
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: '未找到用户'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '用户账号已成功删除'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新用户头像
// @route   PUT /api/users/avatar
// @access  私有
exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({
        success: false,
        error: '请提供头像URL'
      });
    }
    
    // 更新头像
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: {
        avatar: user.avatar
      },
      message: '头像更新成功'
    });
  } catch (error) {
    next(error);
  }
};