import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialUploader } from '@/components/library/material-uploader';
import { LibraryList } from '@/components/library/library-list';

export default function LibraryPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Sua Biblioteca de Materiais</CardTitle>
                    <CardDescription>
                        Faça upload de seus PDFs, DOCX ou TXT para gerar quizzes a partir do seu próprio conteúdo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MaterialUploader />
                </CardContent>
            </Card>

            <LibraryList />
        </div>
    );
}
