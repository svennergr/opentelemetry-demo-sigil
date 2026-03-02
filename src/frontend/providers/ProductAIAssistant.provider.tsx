// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ApiGateway from '../gateways/Api.gateway';

export interface AiRequestPayload {
    question: string;
}

export interface AiMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface AiAssistantContextValue {
    messages: AiMessage[];
    aiLoading: boolean;
    aiError: Error | null;
    sendAiRequest: (payload: AiRequestPayload) => Promise<void>;
    reset: () => void;
}

const Context = createContext<AiAssistantContextValue>({
    messages: [],
    aiLoading: false,
    aiError: null,
    sendAiRequest: async () => {},
    reset: () => {},
});

export const useAiAssistant = () => useContext(Context);

interface ProductAIAssistantProviderProps {
    children: React.ReactNode;
    productId: string;
}

const ProductAIAssistantProvider = ({ children, productId }: ProductAIAssistantProviderProps) => {
    const [messages, setMessages] = useState<AiMessage[]>([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<Error | null>(null);

    const reset = useCallback(() => {
        setMessages([]);
        setAiError(null);
        setAiLoading(false);
    }, []);

    const sendAiRequest = useCallback(
        async ({ question }: AiRequestPayload) => {
            let requestHistory: AiMessage[] = [];
            const userMessage: AiMessage = { role: 'user', content: question };

            setMessages((previous) => {
                requestHistory = previous;
                return [...previous, userMessage];
            });

            setAiError(null);
            setAiLoading(true);

            try {
                const response = await ApiGateway.askProductAIAssistant(
                    productId,
                    question,
                    requestHistory.map((message) => ({
                        role: message.role,
                        content: message.content,
                    }))
                );
                const content = response;
                setMessages((previous) => [...previous, { role: 'assistant', content }]);
            } catch (error) {
                setAiError(error instanceof Error ? error : new Error('AI request failed'));
            } finally {
                setAiLoading(false);
            }
        },
        [productId]
    );

    useEffect(() => {
        reset();
    }, [productId, reset]);

    const value = useMemo(
        () => ({
            messages,
            aiLoading,
            aiError,
            sendAiRequest,
            reset,
        }),
        [messages, aiLoading, aiError, sendAiRequest, reset]
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ProductAIAssistantProvider;
