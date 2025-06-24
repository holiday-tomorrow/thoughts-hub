/**
 * 判断是否为外部链接
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * 验证邮箱格式
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}

/**
 * 验证密码强度
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  return password.length >= 6;
}

/**
 * 验证URL格式
 * @param {string} url
 * @returns {boolean}
 */
export function validateURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})+|((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?))(:\d{1,5})?([\/\w\.-]*)*\/?$/;
  return reg.test(url);
}

/**
 * 格式化时间
 * @param {string|number|Date} time
 * @param {string} format
 * @returns {string}
 */
export function formatDate(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '';
  
  const date = new Date(time);
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  
  return format
    .replace(/YYYY/g, year)
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/DD/g, day.toString().padStart(2, '0'))
    .replace(/HH/g, hour.toString().padStart(2, '0'))
    .replace(/mm/g, minute.toString().padStart(2, '0'))
    .replace(/ss/g, second.toString().padStart(2, '0'));
}