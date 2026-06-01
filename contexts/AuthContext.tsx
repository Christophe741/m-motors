"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  UtilisateurSansPassword,
  AuthContextType,
  RegisterData,
} from "@/lib/types";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UtilisateurSansPassword | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("mmotors_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("mmotors_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("mmotors_user", JSON.stringify(data.user));
        toast.success(`Bienvenue ${data.user.prenom} !`);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || "Email ou mot de passe incorrect",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la connexion",
      };
    }
  };

  const register = async (
    userData: RegisterData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("mmotors_user", JSON.stringify(data.user));
        toast.success("Compte créé avec succès !");
        return { success: true };
      }

      return {
        success: false,
        error: data.error || "Erreur lors de l'inscription",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'inscription",
      };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("mmotors_user");
    toast.success("Vous êtes déconnecté.");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
