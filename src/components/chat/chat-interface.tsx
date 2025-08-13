// src/components/chat/chat-interface.tsx
'use client';

import { useState, useTransition, useEffect, useRef, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, User, Bot } from 'lucide-react';
import type { LibraryItem, QuizAttempt, Message } from '@/lib/types';
import { talkToMentor, MentorInput } from '@/ai/flows/mentor-chat';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


export function ChatInterface() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [libraryItems] = useLocalStorage<LibraryItem[]>('libraryItems', []);
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);
  const [chatHistory, setChatHistory] = useLocalStorage<Message[]>('chatHistory', []);

  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    const sourceId = searchParams.get('sourceId');
    const quizId = searchParams.get('quizId');
    
    if (sourceId) {
      const item = libraryItems.find(i => i.id === sourceId);
      if (item) {
        const prompt = `Olá! Quero conversar sobre o seguinte material da minha biblioteca: "${item.title}".\n\nConteúdo:\n${item.content}`;
        const userMessage: Message = { role: 'user', content: prompt };
        setChatHistory([userMessage]);
        handleStream(prompt, item.content);
      }
    }

    if (quizId) {
        const item = quizHistory.find(q => q.id === quizId);
        if(item) {
            const prompt = `Olá! Quero conversar sobre este quiz que realizei sobre "${item.topic}". Quero que você atue como um tutor e me ajude a entender melhor os pontos que errei.`;
            const userMessage: Message = { role: 'user', content: prompt };
            setChatHistory([userMessage]);
            handleStream(prompt, JSON.stringify(item.quiz, null, 2));
        }
    }
  }, [searchParams, libraryItems, quizHistory]);

  const handleStream = (prompt: string, context?: string) => {
    const input: MentorInput = {
      history: chatHistory,
      prompt,
      context,
    };

    startTransition(async () => {
      try {
        const stream = await talkToMentor(input);
        let accumulatedText = '';
        setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            accumulatedText += chunk;
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].content = accumulatedText;
                return newHistory;
            });
        }
      } catch (error) {
        console.error('Streaming error:', error);
        toast({
          variant: 'destructive',
          title: 'Erro no Chat',
          description: 'Não foi possível obter uma resposta do mentor. Tente novamente.',
        });
      }
    });
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get('prompt') as string;
    if (!prompt.trim()) return;

    const userMessage: Message = { role: 'user', content: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    e.currentTarget.reset();
    handleStream(prompt);
  };
  
  return (
    <div className="h-full flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
            {chatHistory.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                     {message.role === 'model' && <Bot className="h-8 w-8 text-primary shrink-0" />}
                    <div className={cn("max-w-[80%] rounded-lg p-3 text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}/>
                    </div>
                    {message.role === 'user' && <User className="h-8 w-8 text-muted-foreground shrink-0" />}
                </div>
            ))}
             {isPending && (
                <div className="flex items-start gap-4">
                     <Bot className="h-8 w-8 text-primary shrink-0" />
                     <div className="max-w-[80%] rounded-lg p-3 text-sm bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
            )}
            </div>
        </ScrollArea>
        <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input name="prompt" placeholder="Digite sua mensagem..." autoComplete="off" disabled={isPending} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    </div>
  );
}
