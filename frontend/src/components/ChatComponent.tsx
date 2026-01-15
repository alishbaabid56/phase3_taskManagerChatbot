'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './auth/AuthProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatComponent: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { user, token } = useAuth();

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined' && user) {
      const saved = localStorage.getItem(`chat_messages_${user.id}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !token || !user) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/${user.id}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: inputMessage,
            ...(conversationId && { conversation_id: conversationId }),
          }),
        }
      );

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Please log in to use the chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900/60 backdrop-blur-md rounded-xl overflow-hidden">
      
      {/* Header */}
      <div className="border-b border-gray-700 px-4 py-3">
        <h3 className="text-lg font-semibold text-sky-400">
          AI Todo Assistant
        </h3>
        <p className="text-xs text-gray-400">
          Manage tasks using natural language
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Start chatting with your assistant 🤖</p>
            <p className="text-sm mt-1">
              Example: <span className="text-sky-400">Add task buy groceries</span>
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="block mt-1 text-[10px] opacity-60">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl px-4 py-2 flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
