"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleDossierActionsProps {
  vehicleId: string;
  canBuy: boolean;
}

export default function VehicleDossierActions({ vehicleId, canBuy }: VehicleDossierActionsProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleCreateDossier = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour déposer un dossier');
      router.push('/login');
      return;
    }

    if (user.role === 'admin') {
      toast.error('Les administrateurs ne peuvent pas déposer de dossiers');
      return;
    }

    router.push(`/dossier/create?vehicleId=${vehicleId}&type=achat`);
  };

  if (!canBuy) return null;

  return (
    <Button size="lg" className="w-full" onClick={handleCreateDossier}>
      <ShoppingCart className="mr-2 h-5 w-5" />
      Déposer un dossier d&apos;achat
    </Button>
  );
}
