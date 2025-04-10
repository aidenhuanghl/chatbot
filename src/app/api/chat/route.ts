import { NextRequest, NextResponse } from 'next/server';
import { getGrokResponse } from '@/lib/grok'; // 导入Grok API函数

// 设置请求超时时间
const API_TIMEOUT = 25000; // 25秒

// 定义 POST 请求处理函数，用于处理聊天消息
export async function POST(request: NextRequest) {
  // 创建一个超时控制器
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时，请稍后再试'));
    }, API_TIMEOUT);
  });

  try {
    // 使用Promise.race来实现超时控制
    const responsePromise = (async () => {
      // 1. 解析请求体中的用户消息
      const body = await request.json();
      const userMessage: string = body.message;

      if (!userMessage) {
        return NextResponse.json({ success: false, error: '消息内容不能为空' }, { status: 400 });
      }

      console.log('收到用户消息:', userMessage);

      // 2. 直接使用用户消息作为上下文
      console.log('正在准备调用Grok模型...');

      // 3. 调用 Grok 模型生成回答
      const prompt = `
        用户问题: ${userMessage}

        请提供一个简洁、有帮助的回答。
      `;

      // 调用Grok API函数
      const aiAnswer = await getGrokResponse(prompt);
      console.log('Grok回答:', aiAnswer);

      // 4. 返回 AI 的回答给前端
      return NextResponse.json({ success: true, answer: aiAnswer });
    })();

    // 使用Promise.race来实现超时控制
    return await Promise.race([responsePromise, timeoutPromise]);

  } catch (error) {
    console.error('处理聊天消息失败:', error);

    // 根据错误类型返回不同的状态码
    if ((error as Error).message.includes('超时')) {
      return NextResponse.json({
        success: false,
        error: `请求超时: 服务器处理时间过长，请稍后再试`
      }, { status: 504 });
    }

    return NextResponse.json({
      success: false,
      error: `服务器内部错误: ${(error as Error).message}`
    }, { status: 500 });
  }
}
