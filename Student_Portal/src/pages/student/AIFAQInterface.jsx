import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, Zap, MessageCircle, Sparkles, BookOpen } from 'lucide-react';

const AIFAQInterface = () => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', text: "Hello! I'm your AI learning assistant. I can help you clarify concepts, explain assignments, or suggest resources. How can I help you today?", time: 'Now' }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { id: Date.now(), role: 'user', text: input, time: 'Now' };
        setMessages(prev => [...prev, userMsg]);
        const questionText = input;
        setInput('');
        setIsTyping(true);

        try {
            // Call Supabase Edge Function
            // Mock response for UI demo
            await new Promise(resolve => setTimeout(resolve, 1500));

            const botMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                text: "I'm processing your request. In a live environment, I would connect to the knowledge base to provide a specific answer.", // Placeholder for actual API integration
                time: 'Now'
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('AI Error:', err);
            const errMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                text: "My neural links are experiencing turbulence. Protocol: Manual retry required.",
                time: 'Now'
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] relative pb-10">
            {/* Watermark */}
            <div className="fixed right-0 bottom-0 opacity-[0.03] pointer-events-none z-0 transform translate-y-1/4 translate-x-1/4">
                <BookOpen size={600} />
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Learning Assistant</h1>
                    <p className="text-gray-500 mt-1">Get instant answers to your course questions</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        System Online
                    </span>
                </div>
            </div>

            <div className="flex flex-col h-[calc(100%-80px)] bg-white border border-gray-100 shadow-xl rounded-3xl relative overflow-hidden z-10 transition-all">

                {/* Chat Toolbar */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                            <Bot size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">AI Tutor</span>
                            <span className="text-xs text-gray-500">Always available</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full shadow-sm ${msg.role === 'assistant'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-gray-100 text-gray-500'
                                }`}>
                                {msg.role === 'assistant' ? <Bot size={16} /> : <div className="w-full h-full bg-gray-200 rounded-full" />}
                            </div>
                            <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`p-4 text-sm leading-relaxed shadow-sm rounded-2xl ${msg.role === 'assistant'
                                    ? 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                                    : 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                                    }`}>
                                    {msg.text}
                                </div>
                                <p className="text-[10px] font-medium text-gray-400 px-1">{msg.time}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <Bot size={16} />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        {["Explain Module 4 concepts", "Clarify Assignment 2", "Career pathways in BA"].map((suggest, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(suggest)}
                                className="whitespace-nowrap px-4 py-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-primary/50 text-xs font-bold text-gray-600 hover:text-primary rounded-full transition-all"
                            >
                                {suggest}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-primary/30 p-4 pr-16 text-sm font-medium outline-none transition-all rounded-2xl shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-2.5 rounded-xl hover:bg-primary transition-all disabled:opacity-50 disabled:hover:bg-gray-900 shadow-md"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIFAQInterface;
