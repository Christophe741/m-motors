"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.mot_de_passe !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.mot_de_passe.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    // TODO: Appeler l'API d'inscription
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Créer un compte
                </CardTitle>
                <CardDescription>
                  Inscrivez-vous pour accéder à nos services en ligne
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="font-semibold mb-4">
                      Informations personnelles
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom *</Label>
                        <Input
                          id="prenom"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom *</Label>
                        <Input
                          id="nom"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div>
                    <h3 className="font-semibold mb-4">Coordonnées</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="votre@email.fr"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone *</Label>
                        <Input
                          id="telephone"
                          name="telephone"
                          type="tel"
                          placeholder="06 12 34 56 78"
                          value={formData.telephone}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adresse">Adresse complète *</Label>
                        <Input
                          id="adresse"
                          name="adresse"
                          placeholder="123 Rue de la République, 75001 Paris"
                          value={formData.adresse}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <h3 className="font-semibold mb-4">Sécurité</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mot_de_passe">Mot de passe *</Label>
                        <Input
                          id="mot_de_passe"
                          name="mot_de_passe"
                          type="password"
                          placeholder="••••••••"
                          value={formData.mot_de_passe}
                          onChange={handleChange}
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum 6 caractères
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirmer le mot de passe *
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Création du compte..." : "Créer mon compte"}
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Déjà un compte ?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Se connecter
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
