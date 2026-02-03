"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export function Header() {
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
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Inscription</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
