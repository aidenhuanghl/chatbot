import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises'; // Node.js 文件系统模块
import path from 'path'; // Node.js 路径处理模块

// (已移除所有 PDF 相关库的导入)

// 定义 POST 请求处理函数，仅处理文本文件
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求中的文件数据
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: '没有检测到文件' }, { status: 400 });
    }

    console.log(`[Upload API] 收到文件: ${file.name}, 大小: ${file.size}, 类型: ${file.type}`);

    // 检查文件类型是否支持
    if (file.type !== 'text/plain' && file.type !== 'text/markdown') {
      console.log(`[Upload API] 文件类型 "${file.type}" 不支持.`);
      return NextResponse.json({
        success: false, // 标记为失败，因为类型不支持
        message: `文件 "${file.name}" 上传失败：不支持的文件类型 "${file.type}"。请上传 .txt 或 .md 文件。`
      }, { status: 415 }); // 415 Unsupported Media Type
    }

    // --- 本地存储逻辑 (仅供本地开发，生产环境请替换为云存储) ---
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, file.name);

    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log(`[Upload API] 'uploads' 目录已确保存在: ${uploadsDir}`);
    } catch (mkdirError) {
      if ((mkdirError as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw mkdirError;
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    console.log(`[Upload API] 文件已保存到本地: ${filePath}`);
    // --- 本地存储逻辑结束 ---

    // 2. 【核心逻辑】解析文本文件内容
    let parsedText = '';
    let message = '';

    try {
      parsedText = buffer.toString('utf-8');
      console.log(`[Upload API] TXT/MD 文件解析成功. 文本长度: ${parsedText.length}`);
      console.log(`[Upload API] TXT/MD 文本预览: ${parsedText.substring(0, 500)}...`);
      message = `文件 "${file.name}" 上传并解析成功`;
    } catch (parseError) {
        console.error('[Upload API] 解析文本文件失败:', parseError);
        message = `文件 "${file.name}" 已上传但解析失败`;
        // 可以选择返回错误状态
        return NextResponse.json({ success: false, message: message, error: (parseError as Error).message }, { status: 500 });
    }


    // 3. 【后续步骤占位符】处理解析出的文本 (parsedText)
    if (parsedText) {
       console.log('[Upload API] 下一步：对此处获取的 `parsedText` 进行分块、向量化并存入数据库...');
       // --- 在这里添加分块、向量化、存储的代码 ---
    } else {
       console.log('[Upload API] 从 TXT/MD 文件解析出的文本内容为空。');
    }

    // 4. 返回成功响应
    return NextResponse.json({
        success: true,
        message: message,
    });

  } catch (error) {
    console.error('[Upload API] 处理文件上传时发生意外错误:', error);
    return NextResponse.json({ success: false, error: `服务器内部错误: ${(error as Error).message}` }, { status: 500 });
  }
}
