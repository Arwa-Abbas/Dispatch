import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../api/api';
import toast from 'react-hot-toast';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const GREETING: Message = {
  id: '1',
  type: 'bot',
  content: '👋 Hello! I\'m your delivery assistant. Ask me about your shipments!',
  timestamp: new Date(),
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth(); // adjust field name if your hook exposes it differently
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load this specific user's chat history whenever the logged-in account changes
  // (covers login, logout, and switching accounts without a full page reload)
  useEffect(() => {
    if (!user?.id) {
      setMessages([GREETING]);
      return;
    }
    const stored = localStorage.getItem(`chat_messages_${user.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(parsed);
      } catch {
        setMessages([GREETING]);
      }
    } else {
      setMessages([GREETING]);
    }
  }, [user?.id]);

  // Persist this user's history under their own key, so it doesn't leak to the next account
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { message: input });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: res.data.response || 'Sorry, I couldn\'t process that.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-primary-600 text-white rounded-t-lg">
            <span className="font-semibold">Delivery Assistant</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-700 p-1 rounded">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <div
                    className={`text-sm leading-relaxed
                      [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
                      [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-disc
                      [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:list-decimal
                      [&_li]:my-0.5
                      [&_strong]:font-semibold
                      [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
                      ${msg.type === 'user' ? '[&_code]:bg-primary-700' : '[&_code]:bg-gray-200'}
                    `}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className="text-xs opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about shipments..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;