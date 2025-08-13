'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { QuizAttempt } from '@/lib/types';
import { useMemo } from 'react';
import { format } from 'date-fns';

const chartConfig = {
  score: {
    label: 'Pontuação (%)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function EvolutionChart() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);

  const chartData = useMemo(() => {
    return quizHistory
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((attempt, index) => ({
      name: `Quiz ${index + 1}`,
      date: format(new Date(attempt.timestamp), 'dd/MM'),
      score: Math.round((attempt.score / attempt.totalQuestions) * 100),
      topic: attempt.topic,
    })).slice(-15); // Show last 15 quizzes
  }, [quizHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução das Pontuações</CardTitle>
        <CardDescription>Seu desempenho nos últimos quizzes.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={chartData} accessibilityLayer margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    formatter={(value, name, props) => (
                        <div className="flex flex-col">
                            <span>{props.payload.topic}</span>
                            <span className="font-bold">{value}%</span>
                        </div>
                    )}
                />}
              />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        ) : (
            <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Faça mais quizzes para ver sua evolução.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
