-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('SETTER', 'OPPOSITE', 'OUTSIDE_HITTER', 'MIDDLE_BLOCKER', 'LIBERO');

-- CreateEnum
CREATE TYPE "Hand" AS ENUM ('RIGHT', 'LEFT');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "TeamSide" AS ENUM ('HOME', 'OPPONENT');

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('SERVE', 'RECEPTION', 'SET', 'ATTACK', 'BLOCK', 'DEFENSE', 'ERROR', 'POINT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "birthDate" TIMESTAMP(3),
    "heightCm" INTEGER,
    "attackReachCm" INTEGER,
    "blockReachCm" INTEGER,
    "dominantHand" "Hand" NOT NULL DEFAULT 'RIGHT',
    "photoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "coach" TEXT,
    "notes" TEXT,

    CONSTRAINT "Opponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpponentPlayer" (
    "id" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" "PlayerPosition",
    "heightCm" INTEGER,
    "notes" TEXT,

    CONSTRAINT "OpponentPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "season" TEXT NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "phase" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "isHome" BOOLEAN NOT NULL DEFAULT true,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "homeSets" INTEGER NOT NULL DEFAULT 0,
    "opponentSets" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSet" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "opponentScore" INTEGER NOT NULL DEFAULT 0,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "MatchSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lineup" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lineup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineupPlayer" (
    "id" TEXT NOT NULL,
    "lineupId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "courtPosition" INTEGER,
    "serveOrder" INTEGER,
    "isLibero" BOOLEAN NOT NULL DEFAULT false,
    "isStarter" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LineupPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rally" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "startHomeScore" INTEGER NOT NULL,
    "startOpponentScore" INTEGER NOT NULL,
    "endHomeScore" INTEGER NOT NULL,
    "endOpponentScore" INTEGER NOT NULL,
    "servingTeam" "TeamSide" NOT NULL,
    "winner" "TeamSide" NOT NULL,
    "rotation" INTEGER NOT NULL,
    "pointReason" TEXT,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Rally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallySnapshot" (
    "id" TEXT NOT NULL,
    "rallyId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "courtPosition" INTEGER NOT NULL,
    "isServing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RallySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "rallyId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "skill" "Skill" NOT NULL,
    "team" "TeamSide" NOT NULL,
    "playerId" TEXT,
    "opponentPlayerId" TEXT,
    "result" TEXT NOT NULL,
    "zoneFrom" TEXT,
    "zoneTo" TEXT,
    "subtype" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Serve" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "serveType" TEXT NOT NULL,
    "destination" TEXT NOT NULL,

    CONSTRAINT "Serve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reception" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "courtZone" TEXT,
    "quality" TEXT NOT NULL,

    CONSTRAINT "Reception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attack" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "attackType" TEXT NOT NULL,
    "destination" TEXT,

    CONSTRAINT "Attack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Defense" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "quality" TEXT NOT NULL,

    CONSTRAINT "Defense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Substitution" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "score" TEXT NOT NULL,
    "playerInId" TEXT NOT NULL,
    "playerOutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Substitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "rallyId" TEXT,
    "videoUrl" TEXT NOT NULL,
    "startTimestampMs" INTEGER,
    "endTimestampMs" INTEGER,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceState" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Player_teamId_active_idx" ON "Player"("teamId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Player_teamId_number_key" ON "Player"("teamId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "OpponentPlayer_opponentId_number_key" ON "OpponentPlayer"("opponentId", "number");

-- CreateIndex
CREATE INDEX "Match_startsAt_status_idx" ON "Match"("startsAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchSet_matchId_number_key" ON "MatchSet"("matchId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Lineup_matchId_setNumber_key" ON "Lineup"("matchId", "setNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LineupPlayer_lineupId_playerId_key" ON "LineupPlayer"("lineupId", "playerId");

-- CreateIndex
CREATE INDEX "Rally_matchId_setId_rotation_idx" ON "Rally"("matchId", "setId", "rotation");

-- CreateIndex
CREATE UNIQUE INDEX "Rally_matchId_setId_sequence_key" ON "Rally"("matchId", "setId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "RallySnapshot_rallyId_playerId_key" ON "RallySnapshot"("rallyId", "playerId");

-- CreateIndex
CREATE INDEX "Action_playerId_skill_result_idx" ON "Action"("playerId", "skill", "result");

-- CreateIndex
CREATE UNIQUE INDEX "Action_rallyId_sequence_key" ON "Action"("rallyId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "Serve_actionId_key" ON "Serve"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Reception_actionId_key" ON "Reception"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Attack_actionId_key" ON "Attack"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_actionId_key" ON "Block"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Defense_actionId_key" ON "Defense"("actionId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_createdAt_idx" ON "AuditLog"("entity", "entityId", "createdAt");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpponentPlayer" ADD CONSTRAINT "OpponentPlayer_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Opponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Opponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSet" ADD CONSTRAINT "MatchSet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lineup" ADD CONSTRAINT "Lineup_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineupPlayer" ADD CONSTRAINT "LineupPlayer_lineupId_fkey" FOREIGN KEY ("lineupId") REFERENCES "Lineup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineupPlayer" ADD CONSTRAINT "LineupPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_setId_fkey" FOREIGN KEY ("setId") REFERENCES "MatchSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallySnapshot" ADD CONSTRAINT "RallySnapshot_rallyId_fkey" FOREIGN KEY ("rallyId") REFERENCES "Rally"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_rallyId_fkey" FOREIGN KEY ("rallyId") REFERENCES "Rally"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_opponentPlayerId_fkey" FOREIGN KEY ("opponentPlayerId") REFERENCES "OpponentPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serve" ADD CONSTRAINT "Serve_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reception" ADD CONSTRAINT "Reception_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attack" ADD CONSTRAINT "Attack_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defense" ADD CONSTRAINT "Defense_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_rallyId_fkey" FOREIGN KEY ("rallyId") REFERENCES "Rally"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
