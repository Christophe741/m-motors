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

function getInitialUser(): UtilisateurSansPassword | null {
  if (typeof window === "undefined") return null;
  const storedUser = localStorage.getItem("mmotors_user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("mmotors_user");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UtilisateurSansPassword | null>(
    getInitialUser,
  );
  const loading = false;

  useEffect(() => {
    if (user) {
      const userJson = JSON.stringify(user);
      document.cookie = `mmotors_user=${encodeURIComponent(userJson)}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }, [user]);

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
        const userJson = JSON.stringify(data.user);
        localStorage.setItem("mmotors_user", userJson);
        document.cookie = `mmotors_user=${encodeURIComponent(userJson)}; path=/; max-age=${60 * 60 * 24 * 7}`;
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

  return (
    <AuthContext.Provider value={{ user, loading, register }}>
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
