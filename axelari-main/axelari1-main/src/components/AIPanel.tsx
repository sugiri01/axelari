import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, HelpCircle, ListChecks, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function AIPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI learning assistant. I can help explain concepts, generate practice questions, or analyze your learning patterns. What would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    { icon: BookOpen, label: 'Explain differently', color: 'bg-blue-50 text-blue-600' },
    { icon: HelpCircle, label: 'Give example', color: 'bg-teal-50 text-teal-600' },
    { icon: ListChecks, label: 'Quiz me', color: 'bg-purple-50 text-purple-600' },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    const currentInput = input;
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const history = messages.slice(1).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor-chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          history: history,
          topicId: null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const result = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.response || "I'm here to help! Could you please rephrase your question?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Tutor Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Tutor</h2>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
        </div>

        <div className="flex gap-2">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                className={`flex-1 py-2.5 px-3 rounded-lg ${action.color} text-xs font-medium transition-all hover:shadow-md`}
              >
                <Icon size={14} className="mx-auto mb-1" />
                <span className="block">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-[#4C6EF5] text-white'
                  : 'bg-gray-50 text-gray-800'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C6EF5] focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-[#4C6EF5] text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center"
          >
            {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
