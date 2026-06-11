"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, User, LogOut, Menu, X } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Car className="h-6 w-6" />
              <span>M-Motors</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-sm hover:text-primary transition">
                Rechercher
              </Link>
              {user && (
                <>
                  {user.role === "client" && (
                    <Link href="/dashboard" className="text-sm hover:text-primary transition">
                      Mes dossiers
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <>
                      <Link href="/admin/vehicles" className="text-sm hover:text-primary transition">
                        Véhicules
                      </Link>
                      <Link href="/admin/dossiers" className="text-sm hover:text-primary transition">
                        Dossiers
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Desktop user actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100">
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
                  <span className="ml-2">Déconnexion</span>
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

          {/* Hamburger button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-slate-100 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-100">
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
            )}

            <nav className="flex flex-col">
              <Link
                href="/search"
                className="px-3 py-2 text-sm rounded-md hover:bg-slate-100 transition"
                onClick={closeMenu}
              >
                Rechercher
              </Link>
              {user && (
                <>
                  {user.role === "client" && (
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 text-sm rounded-md hover:bg-slate-100 transition"
                      onClick={closeMenu}
                    >
                      Mes dossiers
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <>
                      <Link
                        href="/admin/vehicles"
                        className="px-3 py-2 text-sm rounded-md hover:bg-slate-100 transition"
                        onClick={closeMenu}
                      >
                        Véhicules
                      </Link>
                      <Link
                        href="/admin/dossiers"
                        className="px-3 py-2 text-sm rounded-md hover:bg-slate-100 transition"
                        onClick={closeMenu}
                      >
                        Dossiers
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            <div className="pt-2 border-t">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => { logout(); closeMenu(); }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/login" onClick={closeMenu}>Connexion</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full">
                    <Link href="/register" onClick={closeMenu}>Inscription</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
