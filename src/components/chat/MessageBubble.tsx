"use client";

import { cn } from "@/lib/utils";

interface MessageProps {
    content: string;
    isOwn: boolean;
    time: string;
    sender?: string;
    image?: string;
}

export default function MessageBubble({ message }: { message: MessageProps }) {
    return (
        <div
            className={cn(
                "flex flex-col max-w-[70%] mb-4",
                message.isOwn ? "self-end items-end" : "self-start items-start"
            )}
        >
            {!message.isOwn && message.sender && (
                <span className="text-xs text-text-secondary mb-1 ml-1">
                    {message.sender}
                </span>
            )}
            <div
                className={cn(
                    "px-4 py-3 rounded-2xl shadow-sm",
                    message.isOwn
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-white/80 backdrop-blur-sm text-text-main rounded-bl-none border border-white/20"
                )}
            >
                {message.image ? (
                    <div className="space-y-2">
                        {message.content && message.content !== "[Image]" && <p className="text-sm">{message.content}</p>}
                        <img
                            src={message.image}
                            alt="Attachment"
                            className="max-w-full rounded-lg"
                        />
                    </div>
                ) : message.content.startsWith("[IMAGE] ") ? (
                    <img
                        src={message.content.replace("[IMAGE] ", "")}
                        alt="Attachment"
                        className="max-w-full rounded-lg"
                    />
                ) : (
                    <p className="text-sm">{message.content}</p>
                )}
            </div>
            <span className="text-[10px] text-text-secondary mt-1 opacity-70">
                {message.time}
            </span>
        </div>
    );
}
