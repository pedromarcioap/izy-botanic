// src/app/(app)/analysis/page.tsx
'use client';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIAnalysisReport } from '@/components/analysis/ai-analysis-report';
import { EvolutionChart } from '@/components/analysis/evolution-chart';
import { TopicPerformance } from '@/components/analysis/topic-performance';

function AnalysisContent() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Análise de Desempenho</CardTitle>
                    <CardDescription>
                        Visualize seu progresso, identifique pontos fortes e fracos, e receba um plano de estudos personalizado da nossa IA.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <EvolutionChart />
                    <TopicPerformance />
                </div>
                <div className="lg:col-span-1">
                    <AIAnalysisReport />
                </div>
            </div>
        </div>
    );
}


export default function AnalysisPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AnalysisContent />
        </Suspense>
    );
}
