'use client';

import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { QuizAttempt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { useMemo } from 'react';

export function RecommendedQuiz() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);

  const recommendedTopic = useMemo(() => {
    if (quizHistory.length === 0) {
      return 'Psicologia Cognitiva';
    }

    const topicScores: Record<string, { totalScore: number; count: number }> = {};
    quizHistory.forEach(attempt => {
      const topic = attempt.topic;
      if (!topicScores[topic]) {
        topicScores[topic] = { totalScore: 0, count: 0 };
      }
      topicScores[topic].totalScore += attempt.score;
      topicScores[topic].count += 1;
    });

    let lowestAvg = Infinity;
    let recommended = 'Psicologia Cognitiva';

    for (const topic in topicScores) {
      const avg = (topicScores[topic].totalScore / topicScores[topic].count) * 100;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        recommended = topic;
      }
    }
    return recommended;
  }, [quizHistory]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle>Quiz Personalizado</CardTitle>
                <CardDescription>Recomendação com base no seu desempenho.</CardDescription>
            </div>
            <Lightbulb className="h-6 w-6 text-yellow-400" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm">
          Seu tópico com menor pontuação média é <strong className="font-semibold text-primary">{recommendedTopic}</strong>.
          Que tal um quiz para reforçar?
        </p>
        <Button asChild className="w-full">
          <Link href={`/generate?topic=${encodeURIComponent(recommendedTopic)}`}>Gerar Quiz de {recommendedTopic}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
