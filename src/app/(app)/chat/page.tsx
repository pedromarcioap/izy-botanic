
'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ChatPage() {
  const [libraryItems] = useLocalStorage<any[]>('libraryItems', []);
  const [selectedContext, setSelectedContext] = useState<string | undefined>(undefined);

  // Hydration fix:
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Professor Mentor</h1>
        <p className="text-muted-foreground">
          Converse com a IA para tirar dúvidas. Selecione um item da sua biblioteca para um chat focado.
        </p>
        {isMounted && libraryItems.length > 0 && (
            <Select onValueChange={(value) => setSelectedContext(value === 'none' ? undefined : value)}>
                <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione um contexto da biblioteca..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {libraryItems.map(item => (
                        <SelectItem key={item.id} value={item.content}>{item.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
      </div>
      <ChatInterface sourceContent={selectedContext} />
    </div>
  );
}
