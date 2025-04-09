"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-2.5 group",
          variant === "sent" ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      />
    );
  }
);
ChatBubble.displayName = "ChatBubble";

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
}

const ChatBubbleAvatar = React.forwardRef<HTMLDivElement, ChatBubbleAvatarProps>(
  ({ className, src, fallback, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground overflow-hidden",
          className
        )}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={fallback}
            className="w-full h-full object-cover"
            width={32}
            height={32}
          />
        ) : (
          <span className="text-xs font-medium">{fallback}</span>
        )}
      </div>
    );
  }
);
ChatBubbleAvatar.displayName = "ChatBubbleAvatar";

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  ({ className, variant = "received", isLoading = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 text-sm",
          variant === "sent"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex space-x-1 items-center justify-center h-6">
            <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-current"></div>
            <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-current" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-current" style={{ animationDelay: "0.4s" }}></div>
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

export { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage };
