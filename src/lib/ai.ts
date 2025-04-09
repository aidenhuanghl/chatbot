// src/lib/ai.ts
import OpenAI from 'openai';

// 初始化OpenAI客户端
let openai: OpenAI | null = null;

const initializeOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('未设置OPENAI_API_KEY环境变量');
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('[AI] OpenAI客户端已初始化');
  }

  return openai;
};

// 调用AI模型生成回答的函数
export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const client = initializeOpenAI();

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo', // 可以根据需要更改为其他模型
      messages: [
        { role: 'system', content: '你是一个有帮助的助手，基于提供的上下文回答问题。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || '无法生成回答';
  } catch (error) {
    console.error('[AI] 调用OpenAI API失败:', error);
    return `生成回答时出错: ${(error as Error).message}`;
  }
}
