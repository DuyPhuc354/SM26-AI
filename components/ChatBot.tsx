import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    sources?: any[];
    isLoading?: boolean;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = "gemini-2.5-flash";

const systemInstruction = `You are a helpful Soccer Manager 2026 expert. Your name is 'Tactical Ted'. Answer questions about tactics, players, and game mechanics. When possible, use your search tool to find the most up-to-date information from the web. Keep your answers concise and helpful.`;

export const ChatBot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = () => {
            const chatSession = ai.chats.create({
                model,
                config: {
                    systemInstruction,
                    tools: [{ googleSearch: {} }],
                },
            });
            setChat(chatSession);
            setMessages([
                { id: 'init', role: 'model', text: "Hi! I'm Tactical Ted. Ask me anything about Soccer Manager 2026!" }
            ]);
        };
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessageId = (Date.now() + 1).toString();
        const placeholderMessage: Message = { id: modelMessageId, role: 'model', text: '', isLoading: true };
        setMessages(prev => [...prev, placeholderMessage]);

        try {
            const result = await chat.sendMessageStream({ message: input });
            let fullText = '';
            let sources: any[] = [];
            
            for await (const chunk of result) {
                fullText += chunk.text;
                if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                    sources = [...chunk.candidates[0].groundingMetadata.groundingChunks];
                }
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: fullText, sources } : msg));
            }
            
             setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, isLoading: false } : msg));

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = "Sorry, I encountered an error. Please try again.";
            setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: errorMessage, isLoading: false } : msg));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-gray-800/80 backdrop-blur-md rounded-lg shadow-2xl flex flex-col z-50 border border-gray-700">
            <header className="flex items-center justify-between p-3 border-b border-gray-700">
                <h3 className="text-lg font-bold text-[var(--color-text-accent)]">SM26 Chat Assistant</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            <p className="text-sm">{msg.text}</p>
                            {msg.isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mt-2"></div>}
                             {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 border-t border-gray-500 pt-2">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
                                    <ul className="space-y-1">
                                        {msg.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 hover:underline truncate block">
                                                    {source.web.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-gray-700">
                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask anything..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]"
                        disabled={isLoading}
                    />
                    <button onClick={sendMessage} disabled={isLoading} className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-2 px-4 rounded-r-md disabled:bg-gray-500">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
