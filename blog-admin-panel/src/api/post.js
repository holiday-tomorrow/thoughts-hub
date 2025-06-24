import request from './request';

// 获取文章列表
export function getPosts(params) {
  return request({
    url: '/posts',
    method: 'get',
    params
  });
}

// 获取单篇文章
export function getPost(id) {
  return request({
    url: `/posts/${id}`,
    method: 'get'
  });
}

// 创建文章
export function createPost(data) {
  return request({
    url: '/posts',
    method: 'post',
    data
  });
}

// 更新文章
export function updatePost(id, data) {
  return request({
    url: `/posts/${id}`,
    method: 'put',
    data
  });
}

// 删除文章
export function deletePost(id) {
  return request({
    url: `/posts/${id}`,
    method: 'delete'
  });
}

// 保存草稿
export function savePostDraft(data) {
  return request({
    url: '/posts/draft',
    method: 'post',
    data
  });
}

// 切换文章置顶状态
export function toggleSticky(id) {
  return request({
    url: `/posts/${id}/sticky`,
    method: 'put'
  });
}

// 搜索文章
export function searchPosts(params) {
  return request({
    url: '/posts/search',
    method: 'get',
    params
  });
}

// 按分类获取文章
export function getPostsByCategory(categoryId, params) {
  return request({
    url: `/posts/category/${categoryId}`,
    method: 'get',
    params
  });
}

// 按标签获取文章
export function getPostsByTag(tagId, params) {
  return request({
    url: `/posts/tag/${tagId}`,
    method: 'get',
    params
  });
}

// 按作者获取文章
export function getPostsByAuthor(userId, params) {
  return request({
    url: `/posts/author/${userId}`,
    method: 'get',
    params
  });
}