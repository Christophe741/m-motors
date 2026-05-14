"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleDossierActionsProps {
  vehicleId: string;
  canBuy: boolean;
  canRent: boolean;
}

export default function VehicleDossierActions({ vehicleId, canBuy, canRent }: VehicleDossierActionsProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleCreateDossier = (type: 'achat' | 'location') => {
    if (!user) {
      toast.error('Veuillez vous connecter pour déposer un dossier');
      router.push('/login');
      return;
    }

    if (user.role === 'admin') {
      toast.error('Les administrateurs ne peuvent pas déposer de dossiers');
      return;
    }

    router.push(`/dossier/create?vehicleId=${vehicleId}&type=${type}`);
  };

  if (!canBuy && !canRent) return null;

  return (
    <div className="space-y-3">
      {canBuy && (
        <Button
          size="lg"
          className="w-full"
          onClick={() => handleCreateDossier('achat')}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Déposer un dossier d&apos;achat
        </Button>
      )}
      {canRent && (
        <Button
          size="lg"
          variant={canBuy ? 'outline' : 'default'}
          className="w-full"
          onClick={() => handleCreateDossier('location')}
        >
          <FileText className="mr-2 h-5 w-5" />
          Déposer un dossier de location
        </Button>
      )}
    </div>
  );
}
