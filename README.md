# Titãs Intelligence

MVP de inteligência, scouting e performance para voleibol, criado para a comissão técnica do Titãs Vôlei de Garanhuns-PE.

## Stack

- Next.js 15, React 19 e TypeScript
- Tailwind CSS
- Prisma ORM e PostgreSQL
- Recharts
- Autenticação preparada para Auth.js; o modo demonstração usa sessão local

## Executar

Requer Node.js 20+ e PostgreSQL 15+.

```bash
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`. No modo demonstração, use `admin@titas.volei` e qualquer senha com 4 ou mais caracteres.

Nesta máquina, o Node.js portátil já foi preparado. Também é possível iniciar com:

```powershell
.\iniciar.ps1
```

## Escopo

A implementação atual cobre a Fase 1: login demonstrativo, dashboard, atletas, adversários, partidas, escalação, sets, placar, ralis, fundamentos principais, desfazer e editar rali. Os dados da interface são persistidos no `localStorage`, permitindo validar toda a experiência sem banco configurado. O schema Prisma é a base da persistência PostgreSQL para a evolução do produto.

Leia [docs/ESPECIFICACAO.md](docs/ESPECIFICACAO.md) para arquitetura, modelo de dados, fluxos, telas e roadmap.



