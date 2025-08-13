'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { LibraryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function LibraryList() {
  const [libraryItems, setLibraryItems] = useLocalStorage<LibraryItem[]>('libraryItems', []);

  const handleDelete = (id: string) => {
    setLibraryItems(libraryItems.filter(item => item.id !== id));
  };

  if (libraryItems.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Sua biblioteca está vazia.</p>
        <p className="text-sm text-muted-foreground">Adicione materiais para começar.</p>
      </div>
    );
  }

  return (
    <div>
        <h2 className="text-xl font-semibold mb-4">Seus Materiais</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {libraryItems.map(item => (
            <Card key={item.id} className="flex flex-col">
            <CardHeader>
                <div className="flex items-start gap-4">
                    <FileText className="h-6 w-6 mt-1 text-primary" />
                    <div>
                        <CardTitle className="leading-tight">{item.title}</CardTitle>
                        <CardDescription>Adicionado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                <Link href={`/generate?sourceId=${item.id}`}>Gerar Quiz</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} aria-label={`Deletar ${item.title}`}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
            </Card>>
        ))}
        </div>
    </div>
  );
}
