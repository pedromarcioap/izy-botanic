
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, orderBy, query, Timestamp } from 'firebase/firestore';
import type { LibraryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

const TEMP_USER_ID = 'temp-user';

// Helper function to convert Firestore Timestamp to a displayable string
function formatDate(timestamp: any) {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleDateString('pt-BR');
    }
    if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString('pt-BR');
    }
    return 'Data desconhecida';
}

export function LibraryList() {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const libraryCollectionRef = collection(db, 'users', TEMP_USER_ID, 'libraryItems');
    const q = query(libraryCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LibraryItem));
      setLibraryItems(items);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching library items:", err);
      setError("Não foi possível carregar a biblioteca.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const docRef = doc(db, 'users', TEMP_USER_ID, 'libraryItems', id);
    try {
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting item:", err);
      // Optionally, show a toast notification on error
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Carregando sua biblioteca...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">{error}</div>;
  }

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
                        {item.createdAt && (
                            <CardDescription>
                                Adicionado em {formatDate(item.createdAt)}
                            </CardDescription>
                        )}
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
                <Button asChild variant="secondary" size="sm" className="flex-1">
                   <Link href={`/chat?sourceId=${item.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4"/>
                    Mentor
                   </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} aria-label={`Deletar ${item.title}`}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    </div>
  );
}
