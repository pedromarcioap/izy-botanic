'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WelcomeBanner() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bem-vindo(a) de volta!</CardTitle>
        <CardDescription>
          Pronto para transformar seu estudo em uma experiência de aprendizado ativa e personalizada?
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
