# 部署指南

本文档提供了如何在Vercel上部署此Next.js聊天应用的详细说明。

## Vercel部署步骤

1. 登录或注册[Vercel](https://vercel.com)账户

2. 点击"New Project"按钮

3. 导入你的GitHub仓库(如果尚未连接GitHub，请按照提示进行连接)

4. 配置项目:
   - 框架预设: Next.js
   - 根目录: ./
   - 构建命令: 保持默认

5. 环境变量设置(重要):
   在"Environment Variables"部分，添加以下变量:

   ```
   GROK_API_KEY=你的Grok API密钥
   GROK_API_BASE_URL=https://api.groq.com/openai/v1
   GROK_MODEL=llama3-8b-8192
   USE_MOCK_RESPONSE=false
   ```

   注意: 确保添加了真实的`GROK_API_KEY`，否则应用将无法正常工作。

6. 点击"Deploy"按钮开始部署

7. 等待部署完成，Vercel会提供一个预览URL

## 常见问题排查

### 如果遇到"fetch failed"错误:

1. 检查Vercel环境变量是否正确设置，特别是`GROK_API_KEY`
2. 确认API密钥是否有效，可以通过其他工具测试API密钥
3. 检查Vercel日志以获取更详细的错误信息:
   - 在Vercel仪表板中点击你的项目
   - 导航到"Deployments"标签
   - 选择最新的部署
   - 点击"Functions Logs"查看详细日志

### 如果API调用超时:

1. 检查`next.config.ts`中的超时设置
2. 考虑增加API调用的超时时间
3. 确保Grok API服务正常运行

## 更新部署

当你对代码进行更改并推送到GitHub仓库时，Vercel会自动重新部署你的应用。

如果你需要更新环境变量:
1. 在Vercel仪表板中导航到你的项目
2. 点击"Settings"标签
3. 选择"Environment Variables"
4. 更新或添加所需的变量
5. 点击"Save"保存更改
6. 重新部署应用以应用新的环境变量

## 本地测试生产构建

在推送到Vercel之前，你可以在本地测试生产构建:

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

访问 http://localhost:3000 测试应用。
