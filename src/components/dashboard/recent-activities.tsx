'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { QuizAttempt, LibraryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, BrainCircuit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';

type Activity = {
    id: string;
    type: 'quiz' | 'library';
    title: string;
    date: Date;
};

export function RecentActivities() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);
  const [libraryItems] = useLocalStorage<LibraryItem[]>('libraryItems', []);

  const activities: Activity[] = useMemo(() => {
    const combined = [
        ...(quizHistory || []).map(item => ({
            id: item.id,
            type: 'quiz' as const,
            title: `Quiz: ${item.topic}`,
            date: new Date(item.timestamp),
        })),
        ...(libraryItems || []).map(item => ({
            id: item.id,
            type: 'library' as const,
            title: `Material: ${item.title}`,
            date: new Date(item.createdAt),
        }))
    ];

    return combined
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);
  }, [quizHistory, libraryItems]);

  const ActivityIcon = ({ type }: { type: 'quiz' | 'library' }) => {
    if (type === 'quiz') {
      return <BrainCircuit className="h-5 w-5 text-muted-foreground" />;
    }
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Seus últimos quizzes e materiais.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center pt-4">Nenhuma atividade ainda.</p>
          ) : (
            <div className="space-y-4">
              {activities.map(activity => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <ActivityIcon type={activity.type} />
                    <div className="flex-grow">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(activity.date, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
