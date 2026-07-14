'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface ChatbotMessage {
  sender: 'user' | 'bot';
  text: string;
  createdAt: string;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize bot greeting
  useEffect(() => {
    if (user) {
      setMessages([
        {
          sender: 'bot',
          text: `### 👋 Hello, ${user.firstName}!
I am your **DocAppoint AI Health Assistant**. I can guide you through:
* Symptom checks (e.g. fever, headache, stomach discomfort, cold)
* Self-care tips and guidelines
* Finding the right specialist doctor for your condition

Ask me your questions below, and I will give you expert medical guidance!`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [user]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!user) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');

    // Append user message
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userQuery, createdAt: new Date().toISOString() },
    ]);

    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/ask', { message: userQuery });
      const reply = response.data.data.reply;

      // Append bot message
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, createdAt: new Date().toISOString() },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ **Error**: Failed to connect to AI Assistant. Please verify your connection or retry in a moment.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert markdown-style response to styled JSX elements
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Heading 3
      if (line.trim().startsWith('### ')) {
        return (
          <h4 key={i} className="font-bold text-sm text-primary mt-3 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            {line.substring(4)}
          </h4>
        );
      }
      // List item
      if (line.trim().startsWith('* ')) {
        const parts = line.substring(2).split('**');
        return (
          <li key={i} className="ml-4 list-disc mb-1 leading-relaxed">
            {parts.map((part, index) =>
              index % 2 === 1 ? (
                <strong key={index} className="font-bold text-foreground">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </li>
        );
      }
      // Bold inline parsing
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="mb-1 leading-relaxed">
            {parts.map((part, index) =>
              index % 2 === 1 ? (
                <strong key={index} className="font-bold text-foreground">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      return (
        <p key={i} className="mb-1 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6 h-[80vh] flex flex-col justify-between">
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          AI Health Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Ask questions about symptoms, check care guides, and get recommendation on specialists.
        </p>
      </div>

      {/* Chat Conversation Box */}
      <div className="flex-1 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between overflow-hidden min-h-0">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center relative">
            <Bot className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
          </div>
          <div>
            <h3 className="font-bold text-sm">DocAppoint Virtual Bot</h3>
            <p className="text-[10px] text-muted-foreground">Ask anything • Response in seconds</p>
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar min-h-0 text-sm">
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Icon avatar */}
                <div
                  className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isBot ? 'bg-primary/10 text-primary' : 'bg-teal-500/10 text-teal-600'
                  }`}
                >
                  {isBot ? <Bot className="h-4 w-4" /> : 'Me'}
                </div>

                {/* Message bubble */}
                <div
                  className={`rounded-2xl p-4 shadow-sm border border-border/50 text-foreground ${
                    isBot
                      ? 'bg-card text-muted-foreground'
                      : 'bg-primary text-white border-transparent shadow-md'
                  }`}
                >
                  {isBot ? (
                    <div className="space-y-1">{formatMessageText(msg.text)}</div>
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loader bubble while generating content */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl p-4 bg-card text-muted-foreground border border-border/50 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium">DocAppoint is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-border bg-card flex gap-2 shrink-0"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search symptoms, ask details about cold, fever, stomach aches..."
            className="flex-1 rounded-xl h-11 shadow-sm px-4 focus-visible:ring-1"
            disabled={isLoading}
            required
          />
          <Button type="submit" size="icon" className="rounded-xl h-11 w-11 shrink-0" disabled={isLoading}>
            <Send className="h-4.5 w-4.5" />
          </Button>
        </form>
      </div>

      {/* Safety notice disclaimer */}
      <div className="flex items-center gap-2.5 bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl text-[11px] text-amber-700 dark:text-amber-400 shrink-0">
        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
        <span>
          <strong>Emergency Disclaimer</strong>: Our virtual AI assistant provides guidelines, not diagnostic prescriptions. For immediate or severe medical issues, please consult directly with physical healthcare facilities.
        </span>
      </div>
    </div>
  );
}
