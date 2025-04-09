"use client"

import { useState, FormEvent } from "react"
import { Send, Bot, Paperclip, Mic, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import { ChatMessageList } from "@/components/ui/chat-message-list"

export function ChatDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "👋 你好！我是AI助手，有什么我可以帮助你的吗？",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()

    // 添加用户消息到聊天
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: userMessage,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)

    try {
      // 设置请求超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      try {
        // 调用后端 API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API 请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 添加 AI 回复到聊天
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            content: data.answer || "抱歉，我无法生成回答。",
            sender: "ai",
          },
        ]);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('聊天请求失败:', error);

      let errorMessage = '未知错误';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '请求超时，请稍后再试。';
        } else {
          // 处理各种错误类型
          if (error.message.includes('504') || error.message.includes('超时')) {
            errorMessage = '服务器响应超时，请稍后再试。';
          } else {
            errorMessage = error.message || '发生错误，请稍后再试。';
          }
        }
      }

      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: `抱歉，${errorMessage}`,
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAttachFile = () => {
    //
  }

  const handleMicrophoneClick = () => {
    //
  }

  // 自定义头像组件
  const CustomAvatar = ({ sender }: { sender: string }) => {
    if (sender === "user") {
      return (
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <User className="h-5 w-5" />
        </div>
      )
    } else {
      return (
        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
          <Bot className="h-5 w-5" />
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h2 className="text-xl font-semibold">智能助手</h2>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
              className={message.sender === "user" ? "justify-end" : ""}
            >
              {message.sender !== "user" && (
                <CustomAvatar sender={message.sender} />
              )}
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
                className={message.sender === "user"
                  ? "bg-blue-500 text-white rounded-2xl rounded-tr-none"
                  : "bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-none"}
              >
                {message.content}
              </ChatBubbleMessage>
              {message.sender === "user" && (
                <CustomAvatar sender={message.sender} />
              )}
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <CustomAvatar sender="ai" />
              <ChatBubbleMessage
                isLoading
                className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-none"
              />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="border-t p-4 bg-white dark:bg-gray-900">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-full border bg-background focus-within:ring-2 focus-within:ring-blue-500 p-1 flex items-center"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            className="min-h-10 resize-none rounded-full bg-background border-0 py-2 px-4 shadow-none focus-visible:ring-0 flex-grow"
          />
          <div className="flex items-center gap-1 pr-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleAttachFile}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Paperclip className="size-4 text-gray-500" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleMicrophoneClick}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Mic className="size-4 text-gray-500" />
            </Button>

            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white ml-1"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
