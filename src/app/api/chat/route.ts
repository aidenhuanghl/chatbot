import { NextRequest, NextResponse } from 'next/server';
import { getDeepSeekResponse } from '@/lib/deepseek'; // 导入DeepSeek API函数

// 定义 POST 请求处理函数，用于处理聊天消息
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体中的用户消息
    const body = await request.json();
    const userMessage: string = body.message;

    if (!userMessage) {
      return NextResponse.json({ success: false, error: '消息内容不能为空' }, { status: 400 });
    }

    console.log('收到用户消息:', userMessage);

    // 2. 【简化版】直接使用用户消息作为上下文
    // 在未来可以添加知识库查询功能
    console.log('正在准备调用DeepSeek模型...');

    // 3. 调用 DeepSeek 模型生成回答
    const prompt = `
      用户问题: ${userMessage}

      请提供一个有帮助、准确的回答。
    `;

    // 调用DeepSeek API函数
    const aiAnswer = await getDeepSeekResponse(prompt);
    console.log('DeepSeek回答:', aiAnswer);

    // 4. 返回 AI 的回答给前端
    return NextResponse.json({ success: true, answer: aiAnswer });

  } catch (error) {
    console.error('处理聊天消息失败:', error);
    return NextResponse.json({ success: false, error: `服务器内部错误: ${(error as Error).message}` }, { status: 500 });
  }
}
