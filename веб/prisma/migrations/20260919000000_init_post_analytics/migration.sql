-- Additive init: User, ContentJob, PostAnalytics + enums/indexes
-- Safe: CREATE only. No DROP / truncate / reset.
-- Apply when Postgres is available:
--   npx prisma migrate deploy
--   (or) npx prisma migrate dev

CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN');

CREATE TYPE "JobStatus" AS ENUM (
  'QUEUED',
  'RESEARCHING',
  'GENERATING_COPY',
  'RENDERING_MEDIA',
  'AWAITING_APPROVAL',
  'READY_TO_PUBLISH',
  'PUBLISHED',
  'FAILED'
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'ADMIN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "ContentJob" (
  "id" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
  "hookScore" INTEGER,
  "rawScript" JSONB NOT NULL,
  "generatedMedia" JSONB,
  "feedbackLogs" JSONB,
  "scheduledFor" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContentJob_userId_idx" ON "ContentJob"("userId");
CREATE INDEX "ContentJob_status_idx" ON "ContentJob"("status");
CREATE INDEX "ContentJob_moduleId_idx" ON "ContentJob"("moduleId");
CREATE INDEX "ContentJob_createdAt_idx" ON "ContentJob"("createdAt");

ALTER TABLE "ContentJob"
  ADD CONSTRAINT "ContentJob_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "PostAnalytics" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "saves" INTEGER NOT NULL DEFAULT 0,
  "shares" INTEGER NOT NULL DEFAULT 0,
  "retentionCurve" JSONB,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "contentJobId" TEXT,
  CONSTRAINT "PostAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PostAnalytics_postId_platform_capturedAt_idx"
  ON "PostAnalytics"("postId", "platform", "capturedAt");

ALTER TABLE "PostAnalytics"
  ADD CONSTRAINT "PostAnalytics_contentJobId_fkey"
  FOREIGN KEY ("contentJobId") REFERENCES "ContentJob"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
