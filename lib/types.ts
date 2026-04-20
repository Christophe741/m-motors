// Types pour l'authentification
export type Role = "client" | "admin";

// Interface Utilisateur
export interface Utilisateur {
  id: string;
  email: string;
  mot_de_passe: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  role: Role;
  created_at: string;
}

// Type pour l'utilisateur sans mot de passe (utilisé dans le context)
export type UtilisateurSansPassword = Omit<Utilisateur, "mot_de_passe">;

// Interface pour les données d'inscription
export interface RegisterData {
  email: string;
  mot_de_passe: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
}

// Type du contexte d'authentification
export interface AuthContextType {
  user: UtilisateurSansPassword | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}
