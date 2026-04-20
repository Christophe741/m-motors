"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, User, LogOut } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Car className="h-6 w-6" />
            <span>M-Motors</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="text-sm hover:text-primary transition"
            >
              Rechercher
            </Link>
            {user && (
              <>
                {user.role === "client" && (
                  <Link
                    href="/dashboard"
                    className="text-sm hover:text-primary transition"
                  >
                    Mes dossiers
                  </Link>
                )}
                {user.role === "admin" && (
                  <>
                    <Link
                      href="/admin/vehicles"
                      className="text-sm hover:text-primary transition"
                    >
                      Véhicules
                    </Link>
                    <Link
                      href="/admin/dossiers"
                      className="text-sm hover:text-primary transition"
                    >
                      Dossiers
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {user.prenom} {user.nom}
                  </span>
                  {user.role === "admin" && (
                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Déconnexion</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Inscription</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
