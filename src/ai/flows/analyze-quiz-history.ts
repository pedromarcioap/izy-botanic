
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { ai } from '../genkit';

// Define the Zod schema for the input
const QuizAttemptSchemaForAnalysis = z.object({
    topic: z.string(),
    score: z.number(),
    totalQuestions: z.number(),
    // Include other fields from QuizAttempt that are relevant for the analysis
}).passthrough(); // Use passthrough to allow other fields without validation

export const analyzeQuizHistoryFlow = defineFlow(
  {
    name: 'analyzeQuizHistoryFlow',
    inputSchema: z.array(QuizAttemptSchemaForAnalysis),
    outputSchema: z.object({
        weakestTopics: z.array(z.string()),
        performanceSummary: z.string(),
    }),
  },
  async (history) => {
    if (history.length === 0) {
        return { weakestTopics: [], performanceSummary: "Nenhum histórico de quiz encontrado." };
    }
    
    const prompt = `Analise o seguinte histórico de tentativas de quiz de um aluno. Identifique os tópicos em que o aluno teve o pior desempenho (menor pontuação). Retorne um objeto JSON com duas chaves: "weakestTopics", uma lista dos 3 piores tópicos, e "performanceSummary", um breve resumo do desempenho geral. Histórico: ${JSON.stringify(history)}`;
    
    const llmResponse = await ai.generate({
        prompt,
        config: { responseMimeType: 'application/json' }
    });

    try {
        const resultText = llmResponse.text();
        const result = JSON.parse(resultText);
        return result;
    } catch (e) {
        console.error("Error parsing JSON from AI response:", e, "Raw text:", llmResponse.text());
        return { weakestTopics: [], performanceSummary: "A IA retornou um formato inesperado." };
    }
  }
);
