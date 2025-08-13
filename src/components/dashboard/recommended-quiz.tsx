'use client';

import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { QuizAttempt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

export function RecommendedQuiz() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const recommendedTopic = useMemo(() => {
    if (quizHistory.length === 0) {
      return 'Psicologia Cognitiva';
    }

    const topicScores: Record<string, { totalScore: number; count: number; totalQuestions: number }> = {};
    quizHistory.forEach(attempt => {
      const topic = attempt.topic;
      if (!topicScores[topic]) {
        topicScores[topic] = { totalScore: 0, count: 0, totalQuestions: 0 };
      }
      topicScores[topic].totalScore += attempt.score;
      topicScores[topic].totalQuestions += attempt.totalQuestions;
      topicScores[topic].count += 1;
    });

    let lowestAvg = Infinity;
    let recommended = 'Psicologia Cognitiva';

    for (const topic in topicScores) {
      const { totalScore, totalQuestions } = topicScores[topic];
      if (totalQuestions > 0) {
        const avg = (totalScore / totalQuestions) * 100;
        if (avg < lowestAvg) {
          lowestAvg = avg;
          recommended = topic;
        }
      }
    }
    return recommended;
  }, [quizHistory]);

  if (!isMounted) {
    return null; // Or a loading skeleton
  }

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
