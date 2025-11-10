'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Handle home command locally
    if (messageText.toLowerCase().trim() === 'home') {
      resetToHome();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const responseText = await response.text();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
    setInput('');
  };

  const handleQuickReply = async (reply: string) => {
    await sendMessage(reply);
  };

  const resetToHome = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Card className="w-96 h-[500px] shadow-xl border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            PatentRender Assistant
          </CardTitle>
          <div className="flex gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToHome}
                className="text-white hover:bg-blue-700 h-8 px-2 text-xs"
                title="Return to main menu"
              >
                🏠
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-blue-700 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-[calc(500px-60px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <div className="text-sm space-y-3">
                    <p className="font-semibold text-gray-700">Welcome to PatentRender2! 👋</p>
                    <p className="text-xs">I'm here to help with our IP services.</p>
                    
                    <div className="text-xs text-left bg-blue-50 p-3 rounded-lg space-y-2">
                      <p className="font-semibold text-blue-800 mb-2">Please select a category 👇</p>
                      <div className="space-y-1 text-blue-700">
                        <div>1️⃣ <strong>Core Services Overview</strong></div>
                        <div>2️⃣ <strong>Platform Navigation</strong></div>
                        <div>3️⃣ <strong>Technical Support</strong></div>
                        <div>4️⃣ <strong>Client Feedback</strong></div>
                        <div>5️⃣ <strong>Emergency Support</strong></div>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <Button
                          onClick={() => handleQuickReply('1')}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          <span className="text-blue-600">1️⃣ Core Services Overview</span>
                        </Button>
                        <Button
                          onClick={() => handleQuickReply('2')}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          <span className="text-blue-600">2️⃣ Platform Navigation</span>
                        </Button>
                        <Button
                          onClick={() => handleQuickReply('3')}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          <span className="text-blue-600">3️⃣ Technical Support</span>
                        </Button>
                        <Button
                          onClick={() => handleQuickReply('4')}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          <span className="text-blue-600">4️⃣ Client Feedback</span>
                        </Button>
                        <Button
                          onClick={() => handleQuickReply('5')}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          <span className="text-blue-600">5️⃣ Emergency Support</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      <p><em>Or type a number/category name</em></p>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0 order-2" />
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a number, category, or 'home'..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ChatbotTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
      size="lg"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}