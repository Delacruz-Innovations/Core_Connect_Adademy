import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, Zap, MessageCircle, Sparkles } from 'lucide-react';

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
            const { data, error } = await supabase.functions.invoke('ai-tutor', {
                body: {
                    question: questionText,
                    courseId: 'default' // In a full implementation, we'd pass the actual active course ID
                }
            });

            if (error) throw error;

            const botMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                text: data.answer || "I'm having trouble connecting to my central brain. Please try again in a moment.",
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
        <div className="space-y-8 md:space-y-10 mx-auto h-auto md:h-[calc(100vh-10rem)] max-w-6xl">

            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-gray-100 pb-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Student Support</span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        Learning <span className="text-primary">Assistant</span>
                    </h1>
                </div>
                <div className="flex items-center w-full md:w-auto">
                    <span className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-600 border border-green-100 rounded-sm text-[10px] font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> System Online
                    </span>
                </div>
            </div>

            <div className="flex flex-col h-full bg-white border border-gray-100 shadow-sm relative overflow-hidden rounded-sm">

                {/* Chat Toolbar */}
                <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-sm shadow-sm">
                                <Bot size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none">AI Guided Support</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Version 2.4</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setMessages([messages[0]])}
                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors group"
                        title="Clear Conversation"
                    >
                        <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> Clear History
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white scroll-smooth cursor-default">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-black text-[10px] shadow-sm rounded-full border ${msg.role === 'assistant'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}>
                                {msg.role === 'assistant' ? <Bot size={18} /> : <div className="w-full h-full bg-gray-200 rounded-full" />}
                            </div>
                            <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`p-6 text-sm font-medium leading-relaxed shadow-sm rounded-sm border ${msg.role === 'assistant'
                                    ? 'bg-gray-50 text-gray-700 border-gray-100'
                                    : 'bg-primary text-white border-primary'
                                    }`}>
                                    {msg.text}
                                </div>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{msg.time}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 border-t border-gray-100 bg-white">
                    <form onSubmit={handleSend} className="relative mb-6">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question here..."
                            className="w-full bg-gray-50 border border-gray-100 p-6 pr-24 font-bold text-sm outline-none focus:bg-white focus:border-primary/20 transition-all placeholder:text-gray-300 rounded-sm"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-3 hover:bg-black transition-all disabled:opacity-30 shadow-md rounded-sm"
                        >
                            <Send size={16} />
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">
                            <Sparkles size={12} className="text-primary" />
                            Quick Questions:
                        </div>
                        {["Explain Module 4 concepts", "Clarify Assignment 2", "Career pathways in BA"].map((suggest, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(suggest)}
                                className="bg-white border border-gray-200 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:border-primary hover:text-primary transition-all shadow-sm rounded-sm"
                            >
                                {suggest}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Context Widget (Desktop only) */}
                <div className="absolute right-8 top-28 hidden 2xl:block w-56 space-y-4 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                    <div className="p-6 bg-white border border-gray-100 shadow-lg relative overflow-hidden rounded-sm">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Zap size={32} />
                        </div>
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Context Awareness</h4>
                        <p className="text-[9px] font-bold text-gray-400 leading-relaxed">
                            Viewing: <span className="text-gray-900 border-b border-gray-200">Project Management Fundamentals</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIFAQInterface;
