

import { useState, useCallback } from "react";
import { ChatMessage, ChatContext, ChatApiResponse } from "@/shared/types/chat";
import { api } from "@/app/lib/apiClient";

interface UseChatOptions {
    messages: ChatMessage[];
    onMessageAdd: (message: ChatMessage) => Promise<void>;
}

interface UseChatResult {
    isLoading: boolean;
    error: string | null;
    sendMessage: (
        content: string,
        mapContext?: ChatContext
    ) => Promise<ChatApiResponse | undefined>;
    addMessage: (message: ChatMessage) => Promise<void>;
}

export function useChat({ messages, onMessageAdd }: UseChatOptions): UseChatResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (
            content: string,
            mapContext?: ChatContext
        ): Promise<ChatApiResponse | undefined> => {
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content,
                timestamp: new Date(),
            };

            await onMessageAdd(userMessage);
            setIsLoading(true);
            setError(null);

            try {
                // Clean history: only send role, content, timestamp (as ISO string)
                // For analysis messages with empty content, generate a summary from analysisData
                // so Gemini has proper conversation context
                const cleanedHistory = messages
                    .map((msg) => {
                        let msgContent = msg.content;
                        if (!msgContent && msg.analysisData) {
                            msgContent = `[Market analysis completed for ${msg.analysisData.businessType} in ${msg.analysisData.location}: ${msg.analysisData.redZones.length} red zones, ${msg.analysisData.orangeZones.length} orange zones, ${msg.analysisData.greenZones.length} green zones. Recommendation: ${msg.analysisData.recommendation}]`;
                        }
                        return {
                            id: msg.id,
                            role: msg.role,
                            content: msgContent,
                            timestamp: msg.timestamp.toISOString(),
                        };
                    })
                    .filter((msg) => msg.content);

                const data = await api.post<ChatApiResponse>("/api/assistant/chat", {
                    message: content,
                    history: cleanedHistory,
                    mapContext,
                });

                const assistantMessage: ChatMessage = {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: data.reply,
                    timestamp: new Date(),
                };

                await onMessageAdd(assistantMessage);

                // Return full response for map handling
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Something went wrong";
                setError(errorMessage);

                const errorAssistantMessage: ChatMessage = {
                    id: `assistant-error-${Date.now()}`,
                    role: "assistant",
                    content: `Error: ${errorMessage}`,
                    timestamp: new Date(),
                };
                await onMessageAdd(errorAssistantMessage);
                return undefined;
            } finally {
                setIsLoading(false);
            }
        },
        [messages, onMessageAdd]
    );

    const addMessage = useCallback(
        (message: ChatMessage) => onMessageAdd(message),
        [onMessageAdd]
    );

    return {
        isLoading,
        error,
        sendMessage,
        addMessage,
    };
}
