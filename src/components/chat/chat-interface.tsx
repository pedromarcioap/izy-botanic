
'use client';

import { useState, useTransition, useEffect, useRef, FormEvent } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User } from 'lucide-react';
import type { Message } from '@/lib/types';
import { talkToMentor } from '@/ai/flows/mentor-chat';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  sourceContent?: string;
}

export function ChatInterface({ sourceContent }: ChatInterfaceProps) {
  const { toast } = useToast();
  
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

  const handleResponse = (inputMessages: Message[], context?: string) => {
    startTransition(async () => {
      try {
        const modelMessagePlaceholder: Message = { role: 'model', content: '' };
        setChatHistory(prev => [...prev, modelMessagePlaceholder]);
        
        const responseText = await talkToMentor({
            messages: inputMessages,
            sourceContent: context,
        });

        setChatHistory(prev => {
            const newHistory = [...prev];
            const lastMessage = newHistory[newHistory.length - 1];
            if (lastMessage.role === 'model') {
                lastMessage.content = responseText;
            }
            return newHistory;
        });

      } catch (error) {
        console.error('API call error:', error);
        toast({
          variant: 'destructive',
          title: 'Erro no Chat',
          description: 'Não foi possível obter uma resposta do mentor. Tente novamente.',
        });
        setChatHistory(prev => prev.filter(m => m.content !== ''));
      }
    });
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get('prompt') as string;
    if (!prompt.trim()) return;

    const userMessage: Message = { role: 'user', content: prompt };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    e.currentTarget.reset();

    handleResponse(newHistory, sourceContent);
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
             {isPending && chatHistory[chatHistory.length - 1]?.role === 'model' && (
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
