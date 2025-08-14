
'use client';

import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Hardcoded user ID for now. This will be replaced by the actual user ID from authentication.
const TEMP_USER_ID = 'temp-user';

export function MaterialUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const processFiles = (files: File[]) => {
    startTransition(async () => {
      try {
        const uploadPromises = files.map(file => {
          const content = `Conteúdo extraído de ${file.name}. Esta é uma demonstração; a extração real requer bibliotecas adicionais.`;
          
          const newItem = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            content,
            createdAt: serverTimestamp(),
          };
          
          const libraryCollectionRef = collection(db, 'users', TEMP_USER_ID, 'libraryItems');
          return addDoc(libraryCollectionRef, newItem);
        });

        await Promise.all(uploadPromises);

        toast({
            title: 'Upload Concluído!',
            description: `${files.length} material(is) adicionado(s) à sua biblioteca.`,
        });

      } catch (error) {
        console.error("Error uploading to Firestore:", error);
        toast({
          variant: 'destructive',
          title: 'Erro no Upload',
          description: 'Não foi possível salvar os materiais no banco de dados.',
        });
      }
    });
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors
        ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
    >
      {isPending ? (
        <>
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="mt-4 text-sm text-center text-muted-foreground">Processando...</p>
        </>
      ) : (
        <>
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-center text-muted-foreground">
                <span className="font-semibold text-primary">Clique para fazer upload</span> ou arraste e solte
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX ou TXT</p>
            <input type="file" id="file-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                multiple
                disabled={isPending}
            />
        </>
      )}
    </div>
  );
}
