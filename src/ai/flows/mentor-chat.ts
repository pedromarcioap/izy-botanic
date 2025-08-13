// src/ai/flows/mentor-chat.ts
'use server';

/**
 * @fileOverview A Genkit flow for conversing with an AI mentor.
 *
 * - talkToMentor - A streaming function for chatting with the mentor.
 * - MentorInput - The input type for the talkToMentor function.
 * - Message - The type for a single chat message.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Message } from '@/lib/types';

const MentorInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The chat history between the user and the AI mentor.'),
  prompt: z.string().describe('The latest user prompt.'),
  context: z.string().optional().describe('Optional context, like material content or quiz data.'),
});
export type MentorInput = z.infer<typeof MentorInputSchema>;

export async function talkToMentor(input: MentorInput): Promise<ReadableStream<string>> {
  const { stream } = await ai.generate({
    prompt: `Você é um tutor de psicologia amigável e especialista chamado "Mentor IA". Sua função é ajudar os usuários a entenderem melhor seus materiais de estudo, analisarem seus resultados de quizzes e explorarem tópicos de psicologia.

    Seja didático, encorajador e forneça explicações claras e concisas.
    Baseie-se no histórico da conversa e no contexto fornecido para dar respostas relevantes.

    {{#if context}}
    ---
    CONTEXTO ATUAL (Material de Estudo ou Quiz):
    {{{context}}}
    ---
    {{/if}}`,
    history: input.history,
    config: {
      temperature: 0.5,
    },
    input: {
        context: input.context,
    },
    stream: true,
  });
  
  // Create a new stream to pipe the text chunks through
  const outputStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          controller.enqueue(text);
        }
      }
      controller.close();
    },
  });

  return outputStream;
}
