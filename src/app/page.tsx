'use client';

import { ChatDemo } from '@/components/chat-demo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="z-10 w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          智能聊天助手
        </h1>
        <ChatDemo />
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          © 2024 AI Chat Assistant | 基于 DeepSeek API 构建
        </p>
      </div>
    </main>
  );
}
