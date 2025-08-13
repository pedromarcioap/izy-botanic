'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { QuizAttempt } from '@/lib/types';
import { useMemo } from 'react';
import { subDays, format, startOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const chartConfig = {
  score: {
    label: 'Pontuação Média (%)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function WeeklyPerformance() {
  const [quizHistory] = useLocalStorage<QuizAttempt[]>('quizHistory', []);

  const chartData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    const weeklyData: Record<string, { totalScore: number; count: number }> = {};
    
    // Initialize days of the week
    for (let i = 0; i < 7; i++) {
        const day = subDays(weekStart, -i);
        const dayKey = format(day, 'eee', { locale: ptBR });
        weeklyData[dayKey] = { totalScore: 0, count: 0 };
    }

    const last7DaysInterval = {
        start: subDays(today, 6),
        end: today
    }
    
    const recentHistory = quizHistory.filter(attempt => isWithinInterval(new Date(attempt.timestamp), last7DaysInterval));

    recentHistory.forEach(attempt => {
      const dayKey = format(new Date(attempt.timestamp), 'eee', { locale: ptBR });
      if(weeklyData[dayKey]) {
        weeklyData[dayKey].totalScore += attempt.score / attempt.totalQuestions;
        weeklyData[dayKey].count += 1;
      }
    });

    return Object.entries(weeklyData).map(([day, data]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      score: data.count > 0 ? Math.round((data.totalScore / data.count) * 100) : 0,
    }));
  }, [quizHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Semanal</CardTitle>
        <CardDescription>Sua pontuação média nos últimos 7 dias.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
                tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="score" fill="var(--color-score)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
