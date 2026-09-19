# InternFlow 2.0

Plateforme full-stack de gestion des stages étudiants, construite avec React/Vite et NestJS/Prisma/PostgreSQL.

## Démarrage

Prérequis: Node.js 22+, npm et Docker Desktop (pour PostgreSQL).

```bash
docker compose up -d
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Dans un second terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

API: `http://localhost:3000/api`; documentation Swagger: `http://localhost:3000/api/docs`.

## Architecture

`frontend/src` contient les routes, composants, services Axios et contexte d'authentification. `backend/src` est organisé par modules NestJS (auth, utilisateurs, stages, candidatures, rapports, évaluations et notifications). Prisma porte le schéma relationnel dans `backend/prisma`.