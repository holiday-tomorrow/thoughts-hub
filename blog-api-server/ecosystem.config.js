module.exports = {
  apps: [
    {
      name: 'blog-api-dev',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MONGODB_URI: 'mongodb://localhost:27017/blog_dev',
        JWT_SECRET: 't7w!z%C*F-JaNdRgUkXp2s5v8y/B?E(G+KbPeShVmYq3t6w9z$C&F)H@McQfTjWn',
        JWT_EXPIRE: '7d'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'blog-api-prod',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGODB_URI: 'mongodb://localhost:27017/blog_prod',
        JWT_SECRET: 't7w!z%C*F-JaNdRgUkXp2s5v8y/B?E(G+KbPeShVmYq3t6w9z$C&F)H@McQfTjWn',
        JWT_EXPIRE: '30d'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};