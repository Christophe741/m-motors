// Types pour les offres et statuts
export type TypeOffre = "vente" | "location" | "vente_location";
export type StatutVehicule =
  | "disponible"
  | "reserve"
  | "vendu"
  | "loue"
  | "maintenance";
export type Role = "client" | "admin";

// Interface Véhicule
export interface Vehicule {
  id: string;
  marque: string;
  modele: string;
  motorisation: string;
  kilometrage: number;
  annee: number;
  prix_vente?: number | null;
  prix_location_mensuel?: number | null;
  type_offre: TypeOffre;
  statut: StatutVehicule;
  photos: string[];
  description: string;
  options?: string[];
  carburant?: string;
  transmission?: string;
  puissance?: string;
  couleur?: string;
  created_at: string;
}

// Interface pour les filtres de véhicules
export interface VehicleFilters {
  type_offre?: "vente" | "location";
  marque?: string;
  prix_max?: number;
  annee_min?: number;
  kilometrage_max?: number;
  carburant?: string;
  transmission?: string;
  search?: string;
  statut?: StatutVehicule;
}

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
