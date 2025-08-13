'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { QuizAttempt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

export function TopicPerformance() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);

  const performanceByTopic = useMemo(() => {
    const topicStats: Record<string, { totalScore: number; count: number }> = {};
    quizHistory.forEach(attempt => {
      const topic = attempt.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = { totalScore: 0, count: 0 };
      }
      topicStats[topic].totalScore += (attempt.score / attempt.totalQuestions) * 100;
      topicStats[topic].count += 1;
    });

    return Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      avgScore: Math.round(stats.totalScore / stats.count),
    })).sort((a,b) => b.avgScore - a.avgScore);
  }, [quizHistory]);

  const getColorForScore = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Tópico</CardTitle>
        <CardDescription>Sua pontuação média em cada assunto.</CardDescription>
      </CardHeader>
      <CardContent>
        {performanceByTopic.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center pt-4">Nenhum dado de tópico disponível.</p>
        ) : (
          <div className="space-y-4">
            {performanceByTopic.map(({ topic, avgScore }) => (
              <div key={topic}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{topic}</p>
                  <p className={`text-sm font-semibold ${getColorForScore(avgScore).replace('bg-','text-').replace('-500', '-600')}`}>{avgScore}%</p>
                </div>
                <Progress value={avgScore} className="h-2 [&>div]:bg-green-500" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
