
import { z } from 'zod';
import { ai } from '../genkit';
import { defineFlow } from '@genkit-ai/flow';
import { Message } from '@/lib/types'; // Assuming Message type is defined in types.ts

const MentorInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  sourceContent: z.string().optional(),
});

export const talkToMentor = defineFlow(
  {
    name: 'talkToMentor',
    inputSchema: MentorInputSchema,
    outputSchema: z.string(), // The final output is a complete string
  },
  async ({ messages, sourceContent }) => {
    const systemPrompt = `Você é um tutor de psicologia amigável e especialista chamado "Mentor IA". Sua função é ajudar os usuários a entenderem melhor seus materiais de estudo, analisarem seus resultados de quizzes e explorarem tópicos de psicologia.
Seja didático, encorajador e forneça explicações claras e concisas.
Baseie-se no histórico da conversa e no contexto fornecido para dar respostas relevantes.
${sourceContent ? `\nContexto de Estudo Fornecido Pelo Usuário (Fonte Principal da Verdade):
---
${sourceContent}
---` : ''}`;

    const llmResponse = await ai.generate({
      prompt: {
        system: systemPrompt,
        messages: messages,
      },
      stream: true, // Enable streaming
    });
    
    // Aggregate the streamed response
    let finalResponse = "";
    for await (const chunk of llmResponse.stream()) {
        finalResponse += chunk;
    }

    return finalResponse;
  }
);
