'use client';

import React, { useState, useRef, useCallback, FormEvent, ChangeEvent, KeyboardEvent } from 'react';

// 定义消息对象的类型接口
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

// 主页面组件
export default function Home() {
  // 存储聊天消息的状态
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '您好！我是您的 AI 助手，请问有什么可以帮助您的？您可以上传文件作为知识库。', sender: 'ai' },
  ]);
  // 存储输入框内容的状态
  const [inputValue, setInputValue] = useState<string>('');
  // 存储上传文件名的状态
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  // 存储 AI 是否正在思考的状态
  const [isThinking, setIsThinking] = useState<boolean>(false);
  // 引用文件输入元素
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 引用聊天消息区域的 DOM 元素，用于自动滚动
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到聊天底部
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  // 当消息列表更新时，自动滚动到底部
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理发送消息的函数
  const handleSendMessage = useCallback(async () => {
    const userMessageText = inputValue.trim();
    if (!userMessageText || isThinking) return; // 如果输入为空或 AI 正在思考，则不发送

    // 将用户消息添加到聊天记录
    const newUserMessage: Message = { id: Date.now(), text: userMessageText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue(''); // 清空输入框
    setIsThinking(true); // 设置 AI 为思考状态

    // 调用后端 API
    try {
      console.log('向后端发送消息:', userMessageText);

      // 发送真实的 API 请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessageText }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // 使用从 API 返回的真实 AI 回答
        const aiResponseMessage: Message = { id: Date.now() + 1, text: data.answer, sender: 'ai' };
        setMessages(prevMessages => [...prevMessages, aiResponseMessage]);
      } else {
        throw new Error(data.error || '未知错误');
      }

    } catch (error) {
      console.error('调用 AI API 时出错:', error);
      // 向用户显示错误消息
      const errorMessage: Message = { id: Date.now() + 1, text: `抱歉，处理您的请求时遇到了问题: ${(error as Error).message}`, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsThinking(false); // 取消 AI 思考状态
    }

  }, [inputValue, isThinking]); // 依赖项包括 inputValue 和 isThinking

  // 处理文件选择的函数 (更新版：包含真实的 fetch 调用)
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFileName(`正在上传: ${file.name}...`); // 显示上传中状态

      // 创建 FormData 来包装文件数据
      const formData = new FormData();
      formData.append('file', file); // 'file' key 必须与后端 request.formData().get('file') 一致

      try {
        console.log('[Frontend] 开始上传文件到 /api/upload:', file.name); // 前端日志

        // ***** 发送真实的 POST 请求到后端 API *****
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          // 注意：发送 FormData 时，浏览器会自动设置正确的 Content-Type (multipart/form-data)
          // 不要手动设置 headers['Content-Type']
        });

        // 解析 JSON 响应
        const result = await response.json();

        if (response.ok && result.success) {
          // 上传成功
          setUploadedFileName(`已上传: ${file.name}`);
          // 添加系统消息通知用户上传成功
          const successMessage: Message = {
            id: Date.now(),
            text: `文件 "${file.name}" 已成功上传并处理。您现在可以询问关于此文件的问题。`,
            sender: 'ai'
          };
          setMessages(prevMessages => [...prevMessages, successMessage]);
        } else {
          // 上传失败但服务器返回了响应
          setUploadedFileName(`上传失败: ${file.name}`);
          const errorMessage: Message = {
            id: Date.now(),
            text: result.message || `文件 "${file.name}" 上传失败。`,
            sender: 'ai'
          };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
      } catch (error) {
        // 网络错误或其他异常
        console.error('[Frontend] 文件上传错误:', error);
        setUploadedFileName(`上传错误: ${file.name}`);
        const errorMessage: Message = {
          id: Date.now(),
          text: `文件 "${file.name}" 上传过程中发生错误: ${(error as Error).message}`,
          sender: 'ai'
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }

      // 清除文件输入，以便用户可以再次上传同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理按键事件的函数，当按下 Enter 键时发送消息
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 阻止默认的换行行为
      handleSendMessage();
    }
  };

  // 处理表单提交的函数
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 阻止表单默认提交行为
    handleSendMessage();
  };

  // 处理点击上传按钮的函数
  const handleUploadClick = () => {
    // 触发隐藏的文件输入元素的点击事件
    fileInputRef.current?.click();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
      <div className="z-10 w-full max-w-4xl flex flex-col h-[90vh]">
        <h1 className="text-2xl font-bold mb-4">AI 知识库助手</h1>

        {/* 聊天区域 */}
        <div
          ref={chatAreaRef}
          className="flex-grow overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="text-left mb-4">
              <div className="inline-block rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
                <p>AI 正在思考...</p>
              </div>
            </div>
          )}
        </div>

        {/* 上传文件区域 */}
        <div className="mb-4 flex items-center">
          <button
            onClick={handleUploadClick}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mr-4"
            type="button"
          >
            上传文件
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md,.pdf,.docx,.doc"
          />
          {uploadedFileName && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {uploadedFileName}
            </span>
          )}
        </div>

        {/* 输入区域 */}
        <form onSubmit={handleSubmit} className="flex">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题..."
            className="flex-grow border border-gray-300 rounded-lg p-2 mr-2 resize-none h-[60px] bg-white dark:bg-gray-800 text-black dark:text-white"
            disabled={isThinking}
          />
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ${
              isThinking || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isThinking || !inputValue.trim()}
          >
            发送
          </button>
        </form>
      </div>
    </main>
  );
}
