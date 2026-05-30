"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Une erreur est survenue</h2>
            <p className="text-muted-foreground mb-6">
              Nous nous excusons pour la gêne occasionnée. Veuillez réessayer.
            </p>
            {error.message && (
              <div className="bg-slate-100 rounded p-3 mb-6 text-sm text-left">
                <p className="font-mono text-xs wrap-break-word">{error.message}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => reset()} variant="default">
                Réessayer
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Retour à l&apos;accueil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
