import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ============================================
// DONNÉES
// ============================================

const utilisateurs = [
  {
    id: "admin-1",
    email: "admin@mmotors.fr",
    mot_de_passe:
      "$2b$10$NIgUDfyhyO28z1FUyVLe..IpQpLGMTL81m3NJCkx6UC48Egsb4ubS",
    nom: "Administrateur",
    prenom: "M-Motors",
    telephone: "0123456789",
    adresse: "1 Rue du Commerce, 75001 Paris",
    role: "admin" as const,
    created_at: new Date("2024-01-01T10:00:00.000Z"),
  },
  {
    id: "client-1",
    email: "client@test.fr",
    mot_de_passe:
      "$2b$10$ba7Z5qjRZzVkREvBEhM5HeqjcYmI3ujcnb5GEwVOxS43ir0./99pa",
    nom: "Dupont",
    prenom: "Jean",
    telephone: "0612345678",
    adresse: "10 Avenue des Champs, 69000 Lyon",
    role: "client" as const,
    created_at: new Date("2024-03-15T14:30:00.000Z"),
  },
  {
    id: "client-2",
    email: "marie.martin@email.fr",
    mot_de_passe:
      "$2b$10$YKXWDNFK9oP658YyFtDxBuo04gJtjEy7QncGUZj6qC8TKR0qmYRdS",
    nom: "Martin",
    prenom: "Marie",
    telephone: "0623456789",
    adresse: "25 Rue de la République, 13001 Marseille",
    role: "client" as const,
    created_at: new Date("2024-05-20T09:15:00.000Z"),
  },
  {
    id: "client-3",
    email: "pierre.durand@email.fr",
    mot_de_passe:
      "$2b$10$rUjnkhBvrXgdI39Tjog6F.g24GTyHpg2tmHFLPrewvC/H9moJX3vu",
    nom: "Durand",
    prenom: "Pierre",
    telephone: "0634567890",
    adresse: "5 Place de la Mairie, 33000 Bordeaux",
    role: "client" as const,
    created_at: new Date("2024-06-10T16:45:00.000Z"),
  },
  {
    id: "client-4",
    email: "test@test.com",
    mot_de_passe:
      "$2b$10$xWja2ZL8TuPOcE6Zks7.7e5kJVufGQaP6Le4htfXUUfBZoxCJYdze",
    nom: "Ron",
    prenom: "Marc",
    telephone: "0625123263",
    adresse: "123 rue du moulin",
    role: "client" as const,
    created_at: new Date("2026-01-12T00:40:32.172Z"),
  },
];

const options = [
  {
    id: "opt-1",
    nom: "Assurance tous risques",
    prix_mensuel: 50,
    description: "Couverture complète incluant dommages, vol et bris de glace",
  },
  {
    id: "opt-2",
    nom: "Assistance dépannage 24/7",
    prix_mensuel: 15,
    description: "Assistance routière disponible partout en France",
  },
  {
    id: "opt-3",
    nom: "Entretien et SAV",
    prix_mensuel: 40,
    description: "Entretien régulier et réparations inclus",
  },
  {
    id: "opt-4",
    nom: "Contrôle technique",
    prix_mensuel: 10,
    description: "Contrôle technique pris en charge",
  },
];

const vehicules = [
  {
    id: "veh-1",
    marque: "Peugeot",
    modele: "208",
    motorisation: "1.2 PureTech 100ch",
    kilometrage: 35000,
    annee: 2021,
    prix_vente: 14500,
    prix_location_mensuel: 295,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    ],
    description:
      "Peugeot 208 en excellent état, révision récente effectuée. Idéale pour la ville avec sa consommation réduite.",
    options: ["Climatisation", "GPS", "Radar de recul", "Bluetooth"],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "100 ch",
    couleur: "Blanc",
    created_at: new Date("2025-01-05T10:00:00.000Z"),
  },
  {
    id: "veh-2",
    marque: "Renault",
    modele: "Clio V",
    motorisation: "TCe 90",
    kilometrage: 28000,
    annee: 2022,
    prix_vente: 16200,
    prix_location_mensuel: 320,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
    ],
    description:
      "Renault Clio V récente, équipée du pack connectivité. Parfaite pour les trajets urbains et périurbains.",
    options: [
      "Écran tactile",
      "Caméra de recul",
      "Régulateur de vitesse",
      "Jantes alliage",
    ],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "90 ch",
    couleur: "Rouge",
    created_at: new Date("2025-01-04T14:30:00.000Z"),
  },
  {
    id: "veh-3",
    marque: "Volkswagen",
    modele: "Golf 8",
    motorisation: "2.0 TDI 150ch",
    kilometrage: 42000,
    annee: 2020,
    prix_vente: 22500,
    prix_location_mensuel: 450,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1665411767657-f72503c1f557?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    ],
    description:
      "Volkswagen Golf 8 TDI puissante et économique. Idéale pour les longs trajets avec son confort et sa fiabilité.",
    options: [
      "GPS Premium",
      "Sièges chauffants",
      "Régulateur adaptatif",
      "LED",
      "Toit ouvrant",
    ],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "150 ch",
    couleur: "Gris métallisé",
    created_at: new Date("2025-01-03T09:15:00.000Z"),
  },
  {
    id: "veh-4",
    marque: "BMW",
    modele: "Série 3",
    motorisation: "320d",
    kilometrage: 65000,
    annee: 2019,
    prix_vente: 28900,
    prix_location_mensuel: 580,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
    ],
    description:
      "BMW Série 3 berline sportive et élégante. Parfait équilibre entre performance et confort.",
    options: [
      "Cuir",
      "GPS",
      "Sièges électriques",
      "Caméra 360°",
      "Phares LED",
      "Pack Sport",
    ],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "190 ch",
    couleur: "Noir",
    created_at: new Date("2025-01-02T11:20:00.000Z"),
  },
  {
    id: "veh-5",
    marque: "Mercedes",
    modele: "Classe A",
    motorisation: "A 200d",
    kilometrage: 38000,
    annee: 2021,
    prix_vente: 32500,
    prix_location_mensuel: 650,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    ],
    description:
      "Mercedes Classe A haut de gamme avec finition Premium. Technologie et luxe au rendez-vous.",
    options: [
      "MBUX",
      "Cuir Nappa",
      "Ambiance lumineuse",
      "Caméra 360°",
      "Aide au stationnement",
    ],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "150 ch",
    couleur: "Blanc polaire",
    created_at: new Date("2025-01-01T15:45:00.000Z"),
  },
  {
    id: "veh-6",
    marque: "Citroën",
    modele: "C3",
    motorisation: "1.2 PureTech 82ch",
    kilometrage: 22000,
    annee: 2022,
    prix_vente: 13800,
    prix_location_mensuel: 280,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    ],
    description:
      "Citroën C3 colorée et personnalisable. Parfaite citadine avec un look unique.",
    options: ["Écran tactile", "Bluetooth", "Airbump", "Radar de recul"],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "82 ch",
    couleur: "Orange",
    created_at: new Date("2024-12-28T10:30:00.000Z"),
  },
  {
    id: "veh-7",
    marque: "Audi",
    modele: "A4",
    motorisation: "2.0 TDI 190ch",
    kilometrage: 78000,
    annee: 2018,
    prix_vente: 26500,
    prix_location_mensuel: 530,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?w=800",
      "https://images.unsplash.com/photo-1622198717748-ca120c5590f6?w=800",
    ],
    description:
      "Audi A4 berline premium, très bien entretenue. Confort et élégance allemande.",
    options: [
      "Cuir",
      "Virtual Cockpit",
      "Matrix LED",
      "Sono Bang & Olufsen",
      "Toit ouvrant",
    ],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "190 ch",
    couleur: "Gris Manhattan",
    created_at: new Date("2024-12-25T09:00:00.000Z"),
  },
  {
    id: "veh-8",
    marque: "Toyota",
    modele: "Yaris",
    motorisation: "Hybrid 116h",
    kilometrage: 18000,
    annee: 2023,
    prix_vente: 21500,
    prix_location_mensuel: 430,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
    ],
    description:
      "Toyota Yaris Hybrid récente, consommation très faible. Garantie constructeur restante.",
    options: [
      "Caméra de recul",
      "Écran tactile",
      "Climatisation auto",
      "Safety Sense",
    ],
    carburant: "Hybride",
    transmission: "Automatique",
    puissance: "116 ch",
    couleur: "Bleu",
    created_at: new Date("2024-12-20T14:15:00.000Z"),
  },
  {
    id: "veh-9",
    marque: "Ford",
    modele: "Focus",
    motorisation: "1.0 EcoBoost 125ch",
    kilometrage: 45000,
    annee: 2020,
    prix_vente: 15800,
    prix_location_mensuel: null,
    type_offre: "vente" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    ],
    description:
      "Ford Focus compacte et fiable. Idéale pour la famille avec son coffre spacieux.",
    options: [
      "SYNC 3",
      "Régulateur de vitesse",
      "Détecteur angles morts",
      "Phares auto",
    ],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "125 ch",
    couleur: "Gris",
    created_at: new Date("2024-12-15T11:45:00.000Z"),
  },
  {
    id: "veh-10",
    marque: "Peugeot",
    modele: "3008",
    motorisation: "BlueHDi 130ch",
    kilometrage: 52000,
    annee: 2019,
    prix_vente: 24900,
    prix_location_mensuel: 500,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    ],
    description:
      "Peugeot 3008 SUV familial avec i-Cockpit. Espace et confort pour toute la famille.",
    options: [
      "i-Cockpit",
      "Grip Control",
      "Aide au stationnement",
      "Hayon électrique",
      "Toit panoramique",
    ],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "130 ch",
    couleur: "Bleu",
    created_at: new Date("2024-12-10T08:30:00.000Z"),
  },
  {
    id: "veh-11",
    marque: "Renault",
    modele: "Captur",
    motorisation: "TCe 100",
    kilometrage: 31000,
    annee: 2021,
    prix_vente: 18200,
    prix_location_mensuel: 365,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
    ],
    description:
      "Renault Captur SUV urbain compact. Design moderne et équipements complets.",
    options: ["Easy Link", "Caméra 360°", "Toit biton", "Multi-Sense"],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "100 ch",
    couleur: "Orange",
    created_at: new Date("2024-12-05T13:20:00.000Z"),
  },
  {
    id: "veh-12",
    marque: "Volkswagen",
    modele: "Tiguan",
    motorisation: "2.0 TDI 150ch",
    kilometrage: 68000,
    annee: 2019,
    prix_vente: 29500,
    prix_location_mensuel: 590,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    ],
    description:
      "Volkswagen Tiguan SUV robuste et spacieux. Parfait pour les escapades familiales.",
    options: [
      "Discover Pro",
      "4Motion",
      "Sièges chauffants",
      "Hayon électrique",
      "Park Assist",
    ],
    carburant: "Diesel",
    transmission: "Automatique DSG",
    puissance: "150 ch",
    couleur: "Blanc pur",
    created_at: new Date("2024-11-30T10:15:00.000Z"),
  },
  {
    id: "veh-13",
    marque: "Nissan",
    modele: "Qashqai",
    motorisation: "1.3 DIG-T 140ch",
    kilometrage: 39000,
    annee: 2020,
    prix_vente: 22800,
    prix_location_mensuel: 460,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    ],
    description:
      "Nissan Qashqai crossover polyvalent. Confort de conduite et équipements modernes.",
    options: ["NissanConnect", "ProPilot", "Caméra 360°", 'Jantes 19"'],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "140 ch",
    couleur: "Rouge",
    created_at: new Date("2024-11-25T15:40:00.000Z"),
  },
  {
    id: "veh-14",
    marque: "Opel",
    modele: "Corsa",
    motorisation: "1.2 Turbo 100ch",
    kilometrage: 25000,
    annee: 2022,
    prix_vente: 14900,
    prix_location_mensuel: 300,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    ],
    description:
      "Opel Corsa citadine moderne et économique. Parfaite pour les trajets quotidiens.",
    options: ["IntelliLink", "Caméra de recul", "Climatisation", "LED"],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "100 ch",
    couleur: "Gris",
    created_at: new Date("2024-11-20T09:25:00.000Z"),
  },
  {
    id: "veh-15",
    marque: "Hyundai",
    modele: "Tucson",
    motorisation: "1.6 CRDi 136ch",
    kilometrage: 47000,
    annee: 2020,
    prix_vente: 25500,
    prix_location_mensuel: 510,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      "https://images.unsplash.com/photo-1617531653520-bd466e6aa60c?w=800",
    ],
    description:
      "Hyundai Tucson SUV design avec garantie constructeur étendue. Fiabilité coréenne.",
    options: ['Écran 10.25"', "Hayon smart", "Sellerie cuir", "SmartSense"],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "136 ch",
    couleur: "Blanc",
    created_at: new Date("2024-11-15T11:50:00.000Z"),
  },
  {
    id: "veh-16",
    marque: "Mazda",
    modele: "CX-5",
    motorisation: "Skyactiv-D 150",
    kilometrage: 56000,
    annee: 2019,
    prix_vente: 23900,
    prix_location_mensuel: null,
    type_offre: "vente" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800",
      "https://images.unsplash.com/photo-1583267746897-c27bc90e3d32?w=800",
    ],
    description:
      "Mazda CX-5 SUV élégant et dynamique. Plaisir de conduite garanti.",
    options: ["MZD Connect", "Cuir", "Caméra 360°", "Bose", "i-Activsense"],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "150 ch",
    couleur: "Rouge soul",
    created_at: new Date("2024-11-10T14:35:00.000Z"),
  },
  {
    id: "veh-17",
    marque: "Seat",
    modele: "Ibiza",
    motorisation: "1.0 TSI 95ch",
    kilometrage: 29000,
    annee: 2021,
    prix_vente: null,
    prix_location_mensuel: 270,
    type_offre: "location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    ],
    description:
      "Seat Ibiza sportive et nerveuse. Idéale pour les jeunes conducteurs.",
    options: ["Full Link", "Jantes alu", "Volant sport", "LED"],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "95 ch",
    couleur: "Noir",
    created_at: new Date("2024-11-05T16:20:00.000Z"),
  },
  {
    id: "veh-18",
    marque: "Fiat",
    modele: "500",
    motorisation: "1.2 69ch",
    kilometrage: 21000,
    annee: 2022,
    prix_vente: 11500,
    prix_location_mensuel: 230,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    ],
    description:
      "Fiat 500 iconique et mignonne. La citadine parfaite pour se faufiler partout.",
    options: ["Toit ouvrant", "Écran Uconnect", "Climatisation"],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "69 ch",
    couleur: "Vert",
    created_at: new Date("2024-11-01T10:05:00.000Z"),
  },
  {
    id: "veh-19",
    marque: "Dacia",
    modele: "Duster",
    motorisation: "TCe 130 4x4",
    kilometrage: 41000,
    annee: 2020,
    prix_vente: 16800,
    prix_location_mensuel: 340,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800",
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800",
    ],
    description:
      "Dacia Duster 4x4 robuste et abordable. Parfait pour l'aventure à petit prix.",
    options: ["Media Nav", "4x4", "Barres de toit", "Climatisation"],
    carburant: "Essence",
    transmission: "Manuelle",
    puissance: "130 ch",
    couleur: "Gris",
    created_at: new Date("2024-10-25T12:30:00.000Z"),
  },
  {
    id: "veh-20",
    marque: "Kia",
    modele: "Sportage",
    motorisation: "1.6 CRDi 136ch",
    kilometrage: 34000,
    annee: 2021,
    prix_vente: 27500,
    prix_location_mensuel: 550,
    type_offre: "vente_location" as const,
    statut: "disponible" as const,
    photos: [
      "https://images.unsplash.com/photo-1649921777129-a28a26031a03?w=800",
      "https://images.unsplash.com/photo-1688893288248-3338b8491a46?w=800",
    ],
    description:
      "Kia Sportage SUV moderne avec garantie 7 ans. Design audacieux et équipements premium.",
    options: ['Écran 12.3"', "Hayon smart", "Cuir", "Drive Wise", "JBL"],
    carburant: "Diesel",
    transmission: "Automatique",
    puissance: "136 ch",
    couleur: "Blanc",
    created_at: new Date("2024-10-20T08:45:00.000Z"),
  },
];

const dossiers = [
  {
    id: "dos-1",
    client_id: "client-1",
    vehicule_id: "veh-1",
    type_dossier: "achat" as const,
    statut: "valide" as const,
    date_creation: new Date("2025-01-05T14:00:00.000Z"),
    date_modification: new Date("2026-01-11T00:08:49.334Z"),
    commentaire_admin: "Dossier complet et conforme. Validation approuvée.",
  },
  {
    id: "dos-2",
    client_id: "client-2",
    vehicule_id: "veh-3",
    type_dossier: "location" as const,
    statut: "en_cours" as const,
    date_creation: new Date("2025-01-06T09:00:00.000Z"),
    date_modification: new Date("2026-01-11T00:08:49.344Z"),
    commentaire_admin: "En attente de validation du justificatif de domicile.",
  },
  {
    id: "dos-3",
    client_id: "client-3",
    vehicule_id: "veh-5",
    type_dossier: "location" as const,
    statut: "soumis" as const,
    date_creation: new Date("2025-01-07T10:30:00.000Z"),
    date_modification: new Date("2026-01-11T00:08:49.350Z"),
    commentaire_admin: null,
  },
  {
    id: "dos-4",
    client_id: "client-1",
    vehicule_id: "veh-8",
    type_dossier: "achat" as const,
    statut: "refuse" as const,
    date_creation: new Date("2024-12-20T11:00:00.000Z"),
    date_modification: new Date("2026-01-11T00:08:49.353Z"),
    commentaire_admin:
      "Dossier refusé : carte d'identité expirée. Merci de soumettre un document valide.",
  },
  {
    id: "dos-5",
    client_id: "client-2",
    vehicule_id: "veh-10",
    type_dossier: "location" as const,
    statut: "brouillon" as const,
    date_creation: new Date("2025-01-08T14:20:00.000Z"),
    date_modification: new Date("2026-01-11T00:08:49.355Z"),
    commentaire_admin: null,
  },
  {
    id: "dos-6",
    client_id: "client-1",
    vehicule_id: "veh-1",
    type_dossier: "location" as const,
    statut: "soumis" as const,
    date_creation: new Date("2026-01-11T23:55:13.844Z"),
    date_modification: new Date("2026-01-11T23:55:13.844Z"),
    commentaire_admin: null,
  },
  {
    id: "dos-7",
    client_id: "client-1",
    vehicule_id: "veh-1",
    type_dossier: "achat" as const,
    statut: "valide" as const,
    date_creation: new Date("2026-01-11T23:58:03.865Z"),
    date_modification: new Date("2026-01-12T00:21:10.883Z"),
    commentaire_admin: "Dossier validé",
  },
  {
    id: "dos-8",
    client_id: "client-1",
    vehicule_id: "veh-1",
    type_dossier: "achat" as const,
    statut: "refuse" as const,
    date_creation: new Date("2026-01-12T00:01:44.723Z"),
    date_modification: new Date("2026-01-12T00:20:43.141Z"),
    commentaire_admin: "test",
  },
];

const documents = [
  {
    id: "doc-1",
    dossier_id: "dos-1",
    type_document: "identite" as const,
    fichier_nom: "carte_identite.pdf",
    fichier_type: "application/pdf",
    statut: "valide" as const,
    date_upload: new Date("2025-01-05T14:15:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-2",
    dossier_id: "dos-1",
    type_document: "justificatif_domicile" as const,
    fichier_nom: "facture_edf.pdf",
    fichier_type: "application/pdf",
    statut: "valide" as const,
    date_upload: new Date("2025-01-05T14:18:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-3",
    dossier_id: "dos-1",
    type_document: "justificatif_revenus" as const,
    fichier_nom: "bulletin_salaire.pdf",
    fichier_type: "application/pdf",
    statut: "valide" as const,
    date_upload: new Date("2025-01-05T14:20:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-4",
    dossier_id: "dos-2",
    type_document: "identite" as const,
    fichier_nom: "CNI.pdf",
    fichier_type: "application/pdf",
    statut: "valide" as const,
    date_upload: new Date("2025-01-06T09:10:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-5",
    dossier_id: "dos-2",
    type_document: "permis_conduire" as const,
    fichier_nom: "permis.jpg",
    fichier_type: "image/jpeg",
    statut: "valide" as const,
    date_upload: new Date("2025-01-06T09:12:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-6",
    dossier_id: "dos-2",
    type_document: "justificatif_domicile" as const,
    fichier_nom: "quittance_loyer.pdf",
    fichier_type: "application/pdf",
    statut: "en_attente" as const,
    date_upload: new Date("2025-01-06T09:15:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-7",
    dossier_id: "dos-3",
    type_document: "identite" as const,
    fichier_nom: "passeport.pdf",
    fichier_type: "application/pdf",
    statut: "en_attente" as const,
    date_upload: new Date("2025-01-07T10:35:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-8",
    dossier_id: "dos-3",
    type_document: "permis_conduire" as const,
    fichier_nom: "permis_conduire.pdf",
    fichier_type: "application/pdf",
    statut: "en_attente" as const,
    date_upload: new Date("2025-01-07T10:37:00.000Z"),
    commentaire: null,
  },
  {
    id: "doc-9",
    dossier_id: "dos-4",
    type_document: "identite" as const,
    fichier_nom: "carte_identite_ancienne.pdf",
    fichier_type: "application/pdf",
    statut: "refuse" as const,
    date_upload: new Date("2024-12-20T11:10:00.000Z"),
    commentaire: "Document expiré",
  },
  {
    id: "doc-10",
    dossier_id: "dos-7",
    type_document: "identite" as const,
    fichier_nom: "Nouveau Document texte - Copie (4).txt",
    fichier_type: "text/plain",
    statut: "valide" as const,
    date_upload: new Date("2026-01-11T23:58:03.865Z"),
    commentaire: null,
  },
  {
    id: "doc-11",
    dossier_id: "dos-7",
    type_document: "justificatif_domicile" as const,
    fichier_nom: "Nouveau Document texte - Copie (4).txt",
    fichier_type: "text/plain",
    statut: "valide" as const,
    date_upload: new Date("2026-01-11T23:58:03.865Z"),
    commentaire: null,
  },
  {
    id: "doc-12",
    dossier_id: "dos-7",
    type_document: "justificatif_revenus" as const,
    fichier_nom: "Nouveau Document texte - Copie (4).txt",
    fichier_type: "text/plain",
    statut: "valide" as const,
    date_upload: new Date("2026-01-11T23:58:03.865Z"),
    commentaire: null,
  },
  {
    id: "doc-13",
    dossier_id: "dos-7",
    type_document: "permis_conduire" as const,
    fichier_nom: "Nouveau Document texte - Copie (2).txt",
    fichier_type: "text/plain",
    statut: "valide" as const,
    date_upload: new Date("2026-01-11T23:58:03.865Z"),
    commentaire: null,
  },
  {
    id: "doc-14",
    dossier_id: "dos-8",
    type_document: "identite" as const,
    fichier_nom: "Nouveau Document texte - Copie (2).txt",
    fichier_type: "text/plain",
    statut: "en_attente" as const,
    date_upload: new Date("2026-01-12T00:01:44.723Z"),
    commentaire: null,
  },
  {
    id: "doc-15",
    dossier_id: "dos-8",
    type_document: "justificatif_domicile" as const,
    fichier_nom: "Nouveau Document texte - Copie.txt",
    fichier_type: "text/plain",
    statut: "en_attente" as const,
    date_upload: new Date("2026-01-12T00:01:44.723Z"),
    commentaire: null,
  },
  {
    id: "doc-16",
    dossier_id: "dos-8",
    type_document: "justificatif_revenus" as const,
    fichier_nom: "Nouveau Document texte - Copie.txt",
    fichier_type: "text/plain",
    statut: "en_attente" as const,
    date_upload: new Date("2026-01-12T00:01:44.723Z"),
    commentaire: null,
  },
  {
    id: "doc-17",
    dossier_id: "dos-8",
    type_document: "permis_conduire" as const,
    fichier_nom: "Nouveau Document texte - Copie.txt",
    fichier_type: "text/plain",
    statut: "en_attente" as const,
    date_upload: new Date("2026-01-12T00:01:44.723Z"),
    commentaire: null,
  },
];

const contratsLocation = [
  {
    id: "contrat-1",
    dossier_id: "dos-2",
    duree_mois: 24,
    option_achat: true,
    // prix_rachat fixé par l'admin à la validation (dossier encore en_cours)
    prix_rachat: null,
    // Snapshot figé à la signature (cf. ContratLocation.options_incluses)
    options_incluses: [
      { nom: "Assurance tous risques", prix_mensuel: 50 },
      { nom: "Assistance dépannage 24/7", prix_mensuel: 15 },
      { nom: "Entretien et SAV", prix_mensuel: 40 },
      { nom: "Contrôle technique", prix_mensuel: 10 },
    ],
  },
  {
    id: "contrat-2",
    dossier_id: "dos-3",
    duree_mois: 36,
    option_achat: false,
    prix_rachat: null,
    options_incluses: [
      { nom: "Assurance tous risques", prix_mensuel: 50 },
      { nom: "Assistance dépannage 24/7", prix_mensuel: 15 },
    ],
  },
  {
    id: "contrat-3",
    dossier_id: "dos-5",
    duree_mois: 12,
    option_achat: true,
    // prix_rachat fixé par l'admin à la validation (dossier encore brouillon)
    prix_rachat: null,
    options_incluses: [
      { nom: "Assurance tous risques", prix_mensuel: 50 },
      { nom: "Entretien et SAV", prix_mensuel: 40 },
    ],
  },
  {
    id: "contrat-4",
    dossier_id: "dos-6",
    duree_mois: 24,
    option_achat: true,
    prix_rachat: null,
    options_incluses: [
      { nom: "Assistance dépannage 24/7", prix_mensuel: 15 },
      { nom: "Assurance tous risques", prix_mensuel: 50 },
      { nom: "Contrôle technique", prix_mensuel: 10 },
      { nom: "Entretien et SAV", prix_mensuel: 40 },
    ],
  },
];

// ============================================
// FONCTION PRINCIPALE
// ============================================

async function main() {
  console.log("🌱 Démarrage du seed de la base de données...\n");

  try {
    // 1. Nettoyer les données existantes (ordre des dépendances)
    console.log("🗑️  Nettoyage des données existantes...");
    await prisma.document.deleteMany();
    await prisma.contratLocation.deleteMany();
    await prisma.dossier.deleteMany();
    await prisma.vehicule.deleteMany();
    await prisma.option.deleteMany();
    await prisma.utilisateur.deleteMany();
    console.log("   ✅ Données existantes supprimées\n");

    // 2. Utilisateurs
    console.log("👥 Insertion des utilisateurs...");
    for (const u of utilisateurs) {
      await prisma.utilisateur.create({ data: u });
    }
    console.log(`   ✅ ${utilisateurs.length} utilisateur(s)`);

    // 3. Options
    console.log("⚙️  Insertion des options...");
    for (const o of options) {
      await prisma.option.create({ data: o });
    }
    console.log(`   ✅ ${options.length} option(s)`);

    // 4. Véhicules
    console.log("🚗 Insertion des véhicules...");
    for (const v of vehicules) {
      await prisma.vehicule.create({ data: v });
    }
    console.log(`   ✅ ${vehicules.length} véhicule(s)`);

    // 5. Dossiers
    console.log("📁 Insertion des dossiers...");
    for (const d of dossiers) {
      await prisma.dossier.create({ data: d });
    }
    console.log(`   ✅ ${dossiers.length} dossier(s)`);

    // 6. Documents
    console.log("📄 Insertion des documents...");
    for (const d of documents) {
      await prisma.document.create({ data: d });
    }
    console.log(`   ✅ ${documents.length} document(s)`);

    // 7. Contrats de location
    console.log("📝 Insertion des contrats de location...");
    for (const c of contratsLocation) {
      await prisma.contratLocation.create({ data: c });
    }
    console.log(`   ✅ ${contratsLocation.length} contrat(s) de location`);

    // Résumé
    console.log("\n✅ Seed terminé avec succès!");
    console.log("📊 Résumé:");
    console.log(`   - ${utilisateurs.length} utilisateurs`);
    console.log(`   - ${options.length} options`);
    console.log(`   - ${vehicules.length} véhicules`);
    console.log(`   - ${dossiers.length} dossiers`);
    console.log(`   - ${documents.length} documents`);
    console.log(`   - ${contratsLocation.length} contrats de location`);
    console.log("\n🔐 Identifiants:");
    console.log("   Admin:  admin@mmotors.fr / admin123");
    console.log("   Client: client@test.fr / client123");
    console.log("\n💡 Pour voir les données: npm run db:studio");
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
