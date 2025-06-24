const nodemailer = require('nodemailer');

/**
 * 创建邮件发送器
 * @returns {nodemailer.Transporter} 邮件发送器实例
 */
const createTransporter = () => {
  // 创建一个SMTP传输器
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * 生成随机验证码
 * @param {number} length 验证码长度
 * @returns {string} 生成的验证码
 */
exports.generateVerificationCode = (length = 6) => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 发送邮件
 * @param {Object} options 邮件选项
 * @param {string} options.to 收件人邮箱
 * @param {string} options.subject 邮件主题
 * @param {string} options.text 邮件文本内容
 * @param {string} options.html 邮件HTML内容
 * @returns {Promise<any>} 发送结果
 */
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }
};

/**
 * 发送验证码邮件
 * @param {string} email 收件人邮箱
 * @param {string} code 验证码
 * @param {string} type 验证码类型 (register/login/reset)
 * @returns {Promise<any>} 发送结果
 */
exports.sendVerificationEmail = async (email, code, type) => {
  let subject = '';
  let purpose = '';
  
  switch (type) {
    case 'register':
      subject = '注册验证码';
      purpose = '注册账号';
      break;
    case 'login':
      subject = '登录验证码';
      purpose = '登录账号';
      break;
    case 'reset':
      subject = '重置密码验证码';
      purpose = '重置密码';
      break;
    default:
      subject = '验证码';
      purpose = '验证操作';
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333;">您的${purpose}验证码</h2>
      <p style="font-size: 16px; color: #666;">您好，您正在进行${purpose}操作，验证码为：</p>
      <div style="background-color: #f7f7f7; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p style="font-size: 14px; color: #999;">验证码有效期为10分钟，请勿将验证码泄露给他人。</p>
      <p style="font-size: 14px; color: #999;">如非本人操作，请忽略此邮件。</p>
    </div>
  `;
  
  return await this.sendEmail({
    to: email,
    subject: `【思想中心】${subject}`,
    text: `您的${purpose}验证码是：${code}，有效期为10分钟，请勿泄露给他人。`,
    html,
  });
};