import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { ProfileData } from '../types';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    sources?: any[];
    isLoading?: boolean;
    isRetrieving?: boolean;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = "gemini-3-flash-preview";

export const ChatBot: React.FC<{ profileContext: ProfileData, onClose: () => void }> = ({ profileContext, onClose }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getRetrievalPrompt = () => {
      const tactics = profileContext.savedTactics.map(t => `${t.tacticName} (${t.formation})`).join(', ');
      const historySize = profileContext.matchHistory.length;
      const knowledge = profileContext.aiKnowledge.substring(0, 500);
      
      return `
[LOCAL RETRIEVAL CONTEXT]
The user is managing a club in Soccer Manager 2026.
Saved Tactics: ${tactics || 'None'}
Matches Logged: ${historySize}
Existing Tactical Learnings: ${knowledge || 'None'}
Use this context to personalize your advice. If the user asks about their own tactics or performance, refer to this data.
`;
    };

    useEffect(() => {
        const initChat = () => {
            const chatSession = ai.chats.create({
                model,
                config: {
                    systemInstruction: `You are 'Tactical Ted', a world-class Soccer Manager 2026 expert.
                    ${getRetrievalPrompt()}
                    Always provide data-driven advice. Be encouraging but honest about tactical flaws.`,
                    tools: [{ googleSearch: {} }],
                },
            });
            setChat(chatSession);
            setMessages([
                { id: 'init', role: 'model', text: "Hey coach! Tactical Ted here. I've just indexed your tactics and match history. What are we working on today?" }
            ]);
        };
        initChat();
    }, [profileContext]);

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
        const placeholderMessage: Message = { id: modelMessageId, role: 'model', text: '', isLoading: true, isRetrieving: true };
        setMessages(prev => [...prev, placeholderMessage]);

        try {
            const response = await chat.sendMessageStream({ message: input });
            let fullText = '';
            let sources: any[] = [];
            
            // Simulation of RAG process for visual feedback
            setTimeout(() => {
                 setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, isRetrieving: false } : msg));
            }, 800);

            for await (const chunk of response) {
                fullText += chunk.text;
                if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                    sources = [...chunk.candidates[0].groundingMetadata.groundingChunks];
                }
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: fullText, sources } : msg));
            }
            
             setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, isLoading: false } : msg));

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: "Error syncing with tactical cloud. Try again.", isLoading: false } : msg));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-700/50 overflow-hidden">
            <header className="flex items-center justify-between p-4 bg-gray-800/50 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-white shadow-inner">T</div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Tactical Ted</h3>
                        <p className="text-[10px] text-green-400">Contextual RAG Active</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">&times;</button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700/50'}`}>
                            {msg.isRetrieving && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] text-green-400 font-mono uppercase tracking-tighter">Searching local archives...</span>
                                </div>
                            )}
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            {msg.isLoading && !msg.text && <div className="flex gap-1 mt-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>}
                             {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 border-t border-gray-700 pt-2">
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Web Sources</h4>
                                    <ul className="space-y-1">
                                        {msg.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 truncate block">
                                                    • {source.web?.title}
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
            <div className="p-4 bg-gray-800/50 border-t border-gray-700/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about your tactics..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                        disabled={isLoading}
                    />
                    <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl disabled:bg-gray-700 disabled:text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};