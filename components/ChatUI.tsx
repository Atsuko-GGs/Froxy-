import React, { useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import { Send, User, Sparkles, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatUIProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ChatUI: React.FC<ChatUIProps> = ({ messages, input, setInput, onSubmit, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
      {/* Header */}
      <div className="p-6 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/50">
                <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Gem</h1>
                <p className="text-xs text-cyan-200">AI Companion • Online</p>
            </div>
        </div>
      </div>

      {/* Chat Area - Occupies the left side on desktop, bottom on mobile */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Empty space for the 3D character visibility */}
        <div className="hidden md:block md:w-1/2 lg:w-3/5"></div>

        {/* Messages Container */}
        <div className="flex-1 flex flex-col min-w-0 md:max-w-xl md:mr-8 mb-4 md:mb-8 pointer-events-auto">
          <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide mask-image-gradient">
            {messages.length === 0 && (
                <div className="h-full flex flex-col justify-center items-center text-center text-cyan-100/70 p-8">
                    <p className="mb-2 text-lg">Hi there! I'm Gem.</p>
                    <p className="text-sm">Ask me anything, I'm ready to help!</p>
                </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[85%] px-5 py-3 rounded-2xl text-sm md:text-base backdrop-blur-md shadow-xl transition-all duration-300 ${
                    msg.role === Role.USER
                      ? 'bg-blue-600/80 text-white rounded-br-none border border-blue-500/30'
                      : 'bg-slate-800/80 text-cyan-50 rounded-bl-none border border-slate-700/50'
                  }`}
                >
                  {msg.role === Role.MODEL ? (
                     <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                     </div>
                  ) : (
                    msg.text
                  )}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle"></span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 pt-2">
            <form onSubmit={onSubmit} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative flex items-center glass-panel rounded-full p-1.5 pr-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Gem anything..."
                  className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 px-4 py-3 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="p-3 text-slate-400 hover:text-cyan-300 transition-colors"
                  title="Voice input (simulation)"
                >
                    <Mic className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isLoading || !input.trim()
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};