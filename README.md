# M-Motors

Plateforme web pour une concession automobile d'occasion. Permet la recherche de véhicules, la gestion de dossiers d'achat ou de location longue durée, et le traitement numérique des documents.

---

## Stack technique

| Couche            | Technologie                           |
| ----------------- | ------------------------------------- |
| Framework         | Next.js 16 (App Router) + React 19    |
| Styles            | Tailwind CSS 4 + shadcn/ui (Radix UI) |
| Validation        | Zod 4                                 |
| Base de données   | PostgreSQL 18 + Prisma ORM 7          |
| Authentification  | JWT (Jose) + cookies HTTP-only        |
| Stockage fichiers | UploadThing (justificatifs)           |
| Déploiement       | Vercel                                |
| Langage           | TypeScript 5                          |

---

## Fonctionnalités

- **Catalogue véhicules** — recherche et filtres (marque, prix, année, kilométrage, carburant, transmission)
- **Offres** — vente, location longue durée, ou les deux
- **Comptes utilisateurs** — inscription, connexion, rôles `client` / `admin`
- **Dossiers numériques** — soumission, suivi de statut, upload des justificatifs (PDF / images / texte via UploadThing)
- **Espace client** — tableau de bord avec l'historique des demandes
- **Espace admin** — gestion des dossiers, validation/refus, commentaires, gestion des véhicules

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) **ou** Node.js 20+ et PostgreSQL 18

---

## Installation

### Avec Docker (recommandé)

```bash
# 1. Cloner le dépôt
git clone https://github.com/Christophe741/m-motors.git
cd m-motors

# 2. Créer le fichier d'environnement
# Linux/macOS
cp .env.example .env
# Windows
copy .env.example .env
# Puis renseigner JWT_SECRET et UPLOADTHING_TOKEN dans .env

# 3. Lancer les services (base de données, migrations, application)
docker compose up --build -d

# 4. (Optionnel) Peupler la base avec les données de démonstration
docker compose run --rm migrate node node_modules/prisma/build/index.js db seed
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

> Docker exécute automatiquement les migrations Prisma au démarrage.

---

### Sans Docker (développement local)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement
# Linux/macOS
cp .env.example .env
# Windows
copy .env.example .env
# Puis renseigner JWT_SECRET et UPLOADTHING_TOKEN dans .env

# 3. Appliquer les migrations
npx prisma migrate deploy

# 4. (Optionnel) Peupler la base avec les données de démonstration
npx prisma db seed

# 5. Lancer le serveur de développement
npm run dev
```

> **UploadThing** : crée un compte gratuit sur [uploadthing.com](https://uploadthing.com),
> puis copie le token de ton app (onglet **SDK v7+**) dans `UPLOADTHING_TOKEN`.
> Sans ce token, l'application fonctionne mais l'upload des justificatifs échoue.

---

## Structure du projet

```
m-motors/
├── app/
│   ├── api/                  # Routes API (Next.js Route Handlers)
│   │   ├── auth/             # login, logout, register
│   │   ├── dossiers/         # CRUD dossiers + documents
│   │   ├── vehicles/         # Liste, détail et création de véhicules
│   │   ├── options/          # Options de location
│   │   └── uploadthing/      # Upload des justificatifs (file router)
│   ├── admin/                # Pages protégées (rôle admin)
│   ├── client/               # Pages protégées (rôle client)
│   ├── dashboard/            # Tableau de bord client
│   ├── dossier/              # Gestion des dossiers
│   ├── search/               # Recherche véhicules
│   ├── vehicle/[id]/         # Page détail véhicule
│   ├── login/ & register/    # Pages d'authentification
│   └── page.tsx              # Page d'accueil
├── components/
│   ├── ui/                   # Composants shadcn/ui
│   ├── layout/               # Header, Footer
│   ├── admin/                # Composants espace admin
│   ├── client/               # Composants espace client
│   └── vehicle/              # Composants catalogue
├── server/                   # Logique backend (Prisma queries)
├── lib/                      # Utilitaires (JWT, types, DB, client UploadThing)
├── contexts/                 # AuthContext (React)
├── hooks/                    # Hooks React personnalisés
├── prisma/
│   ├── schema.prisma         # Schéma de la base de données
│   └── migrations/           # Historique des migrations
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## API

| Méthode      | Route                | Description                            | Auth            |
| ------------ | -------------------- | -------------------------------------- | --------------- |
| `POST`       | `/api/auth/register` | Créer un compte                        | —               |
| `POST`       | `/api/auth/login`    | Se connecter                           | —               |
| `POST`       | `/api/auth/logout`   | Se déconnecter                         | —               |
| `GET`        | `/api/vehicles`      | Lister les véhicules (filtres)         | —               |
| `POST`       | `/api/vehicles`      | Créer un véhicule                      | JWT + admin     |
| `GET`        | `/api/vehicles/[id]` | Détail d'un véhicule                   | —               |
| `GET`        | `/api/dossiers`      | Mes dossiers (ou tous si admin)        | JWT             |
| `POST`       | `/api/dossiers`      | Créer un dossier                       | JWT             |
| `GET`        | `/api/dossiers/[id]` | Détail d'un dossier                    | JWT + ownership |
| `PATCH`      | `/api/dossiers/[id]` | Modifier statut / document             | JWT + rôle      |
| `GET`        | `/api/options`       | Lister les options de location         | —               |
| `GET`/`POST` | `/api/uploadthing`   | Upload des justificatifs (UploadThing) | JWT             |

---

## Authentification

- Tokens JWT stockés dans des cookies **HTTP-only** (7 jours)
- Chiffrement des mots de passe avec **bcrypt** (10 rounds)
- Cookies `Secure` en production, `SameSite=strict`
- Contrôle d'accès par rôle (`client` / `admin`) sur toutes les routes sensibles

---

## À propos

Ce projet a été réalisé par Christophe dans le cadre d'un examen de formation Bachelor développeur d'application web chez Studi.
