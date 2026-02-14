-- CreateEnum
CREATE TYPE "TypeOffre" AS ENUM ('vente', 'location', 'vente_location');

-- CreateEnum
CREATE TYPE "StatutVehicule" AS ENUM ('disponible', 'reserve', 'vendu', 'loue', 'maintenance');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'admin');

-- CreateEnum
CREATE TYPE "StatutDossier" AS ENUM ('brouillon', 'soumis', 'en_cours', 'valide', 'refuse');

-- CreateEnum
CREATE TYPE "TypeDossier" AS ENUM ('achat', 'location');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('identite', 'justificatif_domicile', 'justificatif_revenus', 'permis_conduire');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('en_attente', 'valide', 'refuse');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'client',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicules" (
    "id" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "motorisation" TEXT NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "prix_vente" DECIMAL(10,2),
    "prix_location_mensuel" DECIMAL(10,2),
    "type_offre" "TypeOffre" NOT NULL,
    "statut" "StatutVehicule" NOT NULL DEFAULT 'disponible',
    "photos" TEXT[],
    "description" TEXT NOT NULL,
    "options" TEXT[],
    "carburant" TEXT,
    "transmission" TEXT,
    "puissance" TEXT,
    "couleur" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix_mensuel" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossiers" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "vehicule_id" TEXT NOT NULL,
    "type_dossier" "TypeDossier" NOT NULL,
    "statut" "StatutDossier" NOT NULL DEFAULT 'brouillon',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,
    "commentaire_admin" TEXT,

    CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "type_document" "TypeDocument" NOT NULL,
    "fichier_nom" TEXT NOT NULL,
    "fichier_type" TEXT NOT NULL,
    "statut" "StatutDocument" NOT NULL DEFAULT 'en_attente',
    "date_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentaire" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats_location" (
    "id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "duree_mois" INTEGER NOT NULL,
    "option_achat" BOOLEAN NOT NULL DEFAULT false,
    "prix_rachat" DECIMAL(10,2),
    "options_incluses" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrats_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "utilisateurs_email_idx" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "vehicules_marque_modele_idx" ON "vehicules"("marque", "modele");

-- CreateIndex
CREATE INDEX "vehicules_statut_idx" ON "vehicules"("statut");

-- CreateIndex
CREATE INDEX "vehicules_type_offre_idx" ON "vehicules"("type_offre");

-- CreateIndex
CREATE UNIQUE INDEX "options_nom_key" ON "options"("nom");

-- CreateIndex
CREATE INDEX "dossiers_client_id_idx" ON "dossiers"("client_id");

-- CreateIndex
CREATE INDEX "dossiers_vehicule_id_idx" ON "dossiers"("vehicule_id");

-- CreateIndex
CREATE INDEX "dossiers_statut_idx" ON "dossiers"("statut");

-- CreateIndex
CREATE INDEX "documents_dossier_id_idx" ON "documents"("dossier_id");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_location_dossier_id_key" ON "contrats_location"("dossier_id");

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats_location" ADD CONSTRAINT "contrats_location_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
