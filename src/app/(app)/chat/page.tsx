// src/app/(app)/chat/page.tsx
import { ChatInterface } from '@/components/chat/chat-interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl">Chat com o Mentor IA</CardTitle>
          <CardDescription>
            Converse sobre seus materiais de estudo, tire dúvidas sobre quizzes passados ou explore novos tópicos de psicologia.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex-grow">
          <ChatInterface />
      </div>
    </div>
  );
}
