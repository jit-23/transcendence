ALTER TABLE "canvas_collaborator"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';

UPDATE "canvas_collaborator"
SET "status" = 'accepted'
WHERE "status" = 'pending';