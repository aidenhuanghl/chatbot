import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 配置选项 */
  env: {
    // 默认的API基础URL，可以被环境变量覆盖
    GROK_API_BASE_URL: 'https://api.groq.com/openai/v1',
    GROK_MODEL: 'llama3-8b-8192',
    // 在生产环境中默认禁用模拟响应
    USE_MOCK_RESPONSE: process.env.NODE_ENV === 'production' ? 'false' : 'true',
  },
  // 确保在Vercel上正确处理API请求
  async headers() {
    return [
      {
        // 为所有API路由添加CORS头
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
