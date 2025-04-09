// src/lib/deepseek.ts
// 使用原生 fetch API 调用 DeepSeek API

// 直接从环境变量中获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com';

console.log('[INFO] 使用真实DeepSeek API模式');
console.log(`[INFO] DEEPSEEK_API_BASE_URL: ${DEEPSEEK_API_BASE_URL}`);

// 调用DeepSeek模型生成回答的函数
export async function getDeepSeekResponse(prompt: string): Promise<string> {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('未设置DEEPSEEK_API_KEY环境变量');
    }

    console.log('[INFO] 正在调用DeepSeek API...');

    const response = await fetch(`${DEEPSEEK_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个有帮助的助手，基于提供的上下文回答问题。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ERROR] DeepSeek API返回错误:', errorData);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[INFO] DeepSeek API调用成功');

    return data.choices[0]?.message?.content || '无法生成回答';
  } catch (error) {
    console.error('[ERROR] 调用DeepSeek API失败:', error);
    return `生成回答时出错: ${(error as Error).message}`;
  }
}
