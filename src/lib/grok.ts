// src/lib/grok.ts
// 使用原生 fetch API 调用 Grok API

// 从环境变量中获取API密钥
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_BASE_URL = process.env.GROK_API_BASE_URL || 'https://api.groq.com/openai/v1';

// 添加模拟响应模式，当API不可用时使用
const USE_MOCK_RESPONSE = process.env.USE_MOCK_RESPONSE === 'true';

// 在代码中显式禁用SSL验证（仅用于开发环境）
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[INFO] 已禁用SSL验证（仅用于开发环境）');
}

console.log('[INFO] 使用Grok API模式');
console.log(`[INFO] GROK_API_BASE_URL: ${GROK_API_BASE_URL}`);
if (USE_MOCK_RESPONSE) {
  console.log('[INFO] 启用了模拟响应模式，当API不可用时将返回模拟数据');
}

// 模拟响应函数
function getMockResponse(prompt: string): string {
  console.log('[INFO] 使用模拟响应');

  // 提取用户问题，去除提示词
  const userQuestion = prompt.includes('用户问题:')
    ? prompt.split('用户问题:')[1].split('请提供')[0].trim()
    : prompt.trim();

  // 根据不同的问题类型返回不同的模拟回答
  if (userQuestion.includes('你好') || userQuestion.includes('hello') || userQuestion.includes('hi')) {
    return `你好！我是一个模拟的AI助手。很高兴与你交流。由于当前处于模拟模式，我的回答能力有限。你可以问我一些简单的问题，我会尽力回答。`;
  } else if (userQuestion.includes('什么') || userQuestion.includes('what')) {
    return `这是一个基于人工智能的聊天助手应用。目前处于模拟模式，无法连接到真实AI服务。在实际部署时，这个应用将使用Groq API来提供智能的对话能力。`;
  } else {
    return `模拟响应模式已启用。您的问题是: "${userQuestion}"。由于API连接问题，我们暂时无法提供实时回答。请在生产环境中配置正确的API密钥和设置。`;
  }
}

// 添加超时控制的fetch函数
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 10000) {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // 创建一个新的URL对象来解析URL
    const parsedUrl = new URL(url);

    // 如果是https协议，添加自定义的agent选项
    const fetchOptions = {
      ...options,
      signal,
    };

    console.log(`[INFO] 请求URL: ${parsedUrl.toString()}`);

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[ERROR] Fetch请求失败:', error);
    throw error;
  }
}

// 调用Grok模型生成回答的函数
export async function getGrokResponse(prompt: string): Promise<string> {
  // 如果启用了模拟响应模式且没有API密钥，或者在开发环境中遇到SSL问题，直接返回模拟数据
  if (USE_MOCK_RESPONSE && (!GROK_API_KEY || process.env.NODE_ENV !== 'production')) {
    console.log('[INFO] 使用模拟响应模式，跳过API调用');
    return getMockResponse(prompt);
  }

  // 最大重试次数
  const MAX_RETRIES = 2;
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      if (!GROK_API_KEY) {
        throw new Error('未设置GROK_API_KEY环境变量');
      }

      console.log(`[INFO] 正在调用Grok API... (尝试 ${retries + 1}/${MAX_RETRIES + 1})`);

      // 使用带超时的fetch
      const response = await fetchWithTimeout(
        `${GROK_API_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',  // 使用Groq API的Llama 3模型
            messages: [
              { role: 'system', content: '你是一个有帮助的助手，基于提供的上下文回答问题。' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 800,
            stream: false
          })
        },
        15000 // 15秒超时
      );

      if (!response.ok) {
        let errorMessage = `API请求失败: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('[ERROR] Grok API返回错误:', errorData);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch {
          // 如果无法解析JSON，使用原始错误信息
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[INFO] Grok API调用成功');

      // Grok API返回格式可能与DeepSeek不同，根据实际情况调整
      return data.choices[0]?.message?.content || '无法生成回答';
    } catch (error) {
      console.error(`[ERROR] 调用Grok API失败 (尝试 ${retries + 1}/${MAX_RETRIES + 1}):`, error);

      // 如果是超时错误或网络错误，尝试重试
      if ((error instanceof Error && error.name === 'AbortError') ||
          (error instanceof TypeError && error.message.includes('network'))) {
        if (retries < MAX_RETRIES) {
          retries++;
          // 指数退避策略
          const delay = 1000 * Math.pow(2, retries);
          console.log(`[INFO] ${delay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // 如果启用了模拟响应模式，在所有重试失败后返回模拟数据
      if (USE_MOCK_RESPONSE) {
        return getMockResponse(prompt);
      }

      return `生成回答时出错: ${(error as Error).message}`;
    }
  }

  // 这行代码理论上不会执行，但TypeScript需要一个返回值
  return '所有API请求尝试均失败';
}
