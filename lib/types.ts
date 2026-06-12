// Types pour les offres et statuts
export type TypeOffre = "vente" | "location" | "vente_location";
export type StatutVehicule =
  | "disponible"
  | "reserve"
  | "vendu"
  | "loue"
  | "maintenance";
export type Role = "client" | "admin";
export type StatutDossier = "brouillon" | "soumis" | "en_cours" | "valide" | "refuse";
export type TypeDossier = "achat" | "location";
export type TypeDocument = "identite" | "justificatif_domicile" | "justificatif_revenus" | "permis_conduire";
export type StatutDocument = "en_attente" | "valide" | "refuse";

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

// Champs renvoyés dans les listes de véhicules (la description et les
// options ne sont chargées que sur la page détail)
export type VehiculeListItem = Omit<Vehicule, "description" | "options">;

// Métadonnées de pagination renvoyées par l'API
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Interface pour les filtres de véhicules
export interface VehicleFilters {
  type_offre?: "vente" | "location";
  marque?: string;
  prix_min?: number;
  prix_max?: number;
  annee_min?: number;
  annee_max?: number;
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

// Interface Option
export interface Option {
  id: string;
  nom: string;
  prix_mensuel: number;
  description: string;
  created_at: string;
}

// Interface ContratLocation
export interface ContratLocation {
  id: string;
  dossier_id: string;
  duree_mois: number;
  option_achat: boolean;
  prix_rachat?: number | null;
  options_incluses: string[];
  created_at: string;
}

// Interface Document
export interface Document {
  id: string;
  dossier_id: string;
  type_document: TypeDocument;
  fichier_nom: string;
  fichier_type: string;
  fichier_url?: string | null;
  fichier_key?: string | null;
  statut: StatutDocument;
  date_upload: string;
  commentaire?: string;
}

// Interface Dossier
export interface Dossier {
  id: string;
  client_id: string;
  vehicule_id: string;
  type_dossier: TypeDossier;
  statut: StatutDossier;
  date_creation: string;
  date_modification: string;
  documents: Document[];
  contrat_location?: ContratLocation;
  commentaire_admin?: string;
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
