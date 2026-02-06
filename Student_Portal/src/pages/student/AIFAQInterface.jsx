import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, Trash2, ArrowRight, Zap } from 'lucide-react';
import { useFadeInOnScroll } from '../../hooks/useScrollAnimations';

const AIFAQInterface = () => {
    const chatRef = useFadeInOnScroll('up', 0.6);
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', text: "Hello! I'm your AI learning assistant. I've been primed with your current course materials. How can I help you today?", time: 'Now' }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', text: input, time: 'Now' };
        setMessages([...messages, userMsg]);
        setInput('');

        // Simulate AI "typing"
        setTimeout(() => {
            const botMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                text: "Thanks for asking! As of now, this is a UI placeholder. In the full implementation, I'll provide instant answers based on your course documents, video transcripts, and the CCA knowledge base.",
                time: 'Now'
            };
            setMessages(prev => [...prev, botMsg]);
        }, 800);
    };

    return (
        <div ref={chatRef} className="h-[calc(100vh-14rem)] flex flex-col max-w-5xl mx-auto bg-white border border-gray-100 shadow-2xl relative">

            {/* Chat Header */}
            <div className="p-4 md:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black italic uppercase tracking-[0.2em]">Learning Support AI</h2>
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Online & Ready
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([messages[0]])}
                    className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                    title="Clear Conversation"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-black text-xs ${msg.role === 'assistant' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {msg.role === 'assistant' ? 'AI' : 'YOU'}
                        </div>
                        <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`p-4 md:p-6 text-xs md:text-sm font-medium leading-relaxed ${msg.role === 'assistant' ? 'bg-gray-50 text-gray-600 italic border-l-2 border-primary' : 'bg-black text-white'
                                }`}>
                                {msg.text}
                            </div>
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{msg.time}</p>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-8 border-t border-gray-100 bg-white">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about your courses..."
                        className="w-full bg-gray-50 border-0 p-6 pr-24 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all rounded-none"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-3 hover:bg-primary transition-all disabled:opacity-30"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <div className="mt-6 flex flex-wrap gap-4">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Quick suggestions:</span>
                    {["Process Map rules", "Risk Register help", "Course deadline info"].map((suggest, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(suggest)}
                            className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-black transition-colors border-b border-primary/20"
                        >
                            {suggest}
                        </button>
                    ))}
                </div>
            </div>

            {/* Side context info */}
            <div className="absolute -right-48 top-0 bottom-0 w-40 hidden xl:flex flex-col gap-6 pt-12">
                <div className="p-6 bg-primary/5 border border-primary/10">
                    <Zap size={20} className="text-primary mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contextual Learning</p>
                    <p className="text-[9px] font-medium text-gray-500 italic mt-2">I can currently see your progress in 'Business Analysis Basics'.</p>
                </div>
            </div>
        </div>
    );
};

export default AIFAQInterface;
