-- Sprint 8 SoT (C-s8-01): Draft, Board, ScheduleSlot, DesignSlot + enums
-- Additive only: CREATE TYPE / CREATE TABLE / indexes / FKs.
-- Safe: no DROP / truncate / reset / ALTER of existing User|ContentJob|PostAnalytics columns.

CREATE TYPE "DraftStatus" AS ENUM ('UNPUBLISHED', 'SCHEDULED');

CREATE TYPE "ScheduleSlotStatus" AS ENUM ('DRAFT', 'SCHEDULED');

CREATE TABLE "Draft" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL DEFAULT 'carousel-engine',
  "status" "DraftStatus" NOT NULL DEFAULT 'UNPUBLISHED',
  "title" TEXT NOT NULL,
  "slides" JSONB NOT NULL,
  "scenario" TEXT,
  "payload" JSONB,
  "contentJobId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Draft_userId_moduleId_idx" ON "Draft"("userId", "moduleId");
CREATE INDEX "Draft_userId_updatedAt_idx" ON "Draft"("userId", "updatedAt");

ALTER TABLE "Draft"
  ADD CONSTRAINT "Draft_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Draft"
  ADD CONSTRAINT "Draft_contentJobId_fkey"
  FOREIGN KEY ("contentJobId") REFERENCES "ContentJob"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Board" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slideUrls" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Board_userId_idx" ON "Board"("userId");

ALTER TABLE "Board"
  ADD CONSTRAINT "Board_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ScheduleSlot" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "postId" TEXT NOT NULL,
  "draftId" TEXT,
  "contentJobId" TEXT,
  "platformId" TEXT,
  "status" "ScheduleSlotStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScheduleSlot_userId_startsAt_idx" ON "ScheduleSlot"("userId", "startsAt");
CREATE UNIQUE INDEX "ScheduleSlot_userId_postId_key" ON "ScheduleSlot"("userId", "postId");

ALTER TABLE "ScheduleSlot"
  ADD CONSTRAINT "ScheduleSlot_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ScheduleSlot"
  ADD CONSTRAINT "ScheduleSlot_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "Draft"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ScheduleSlot"
  ADD CONSTRAINT "ScheduleSlot_contentJobId_fkey"
  FOREIGN KEY ("contentJobId") REFERENCES "ContentJob"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "DesignSlot" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "markdown" TEXT NOT NULL,
  "html" TEXT,
  "previewUrl" TEXT,
  "brandbook" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DesignSlot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DesignSlot_userId_idx" ON "DesignSlot"("userId");
CREATE INDEX "DesignSlot_userId_isActive_idx" ON "DesignSlot"("userId", "isActive");

ALTER TABLE "DesignSlot"
  ADD CONSTRAINT "DesignSlot_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
