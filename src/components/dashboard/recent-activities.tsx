'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { QuizAttempt, LibraryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, BrainCircuit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RecentActivities() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);
  const [libraryItems] = useLocalStorage<LibraryItem[]>('libraryItems', []);

  const activities = [...quizHistory, ...libraryItems]
    .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
    .slice(0, 10);

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
              {activities.map(activity => {
                const isQuiz = 'topic' in activity;
                const Icon = isQuiz ? BrainCircuit : FileText;
                const title = isQuiz ? `Quiz: ${activity.topic}` : `Material: ${activity.title}`;
                const date = new Date(isQuiz ? activity.timestamp : activity.createdAt);
                
                return (
                  <div key={activity.id} className="flex items-center gap-4">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium leading-none">{title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
