import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import CreateDossierClient from '@/components/client/CreateDossierClient';

export default function CreateDossierPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-slate-50 py-8">
        <Suspense fallback={
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        }>
          <CreateDossierClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
