-- CreateTable
CREATE TABLE "canvas_collaborator" (
    "canvasId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canvas_collaborator_pkey" PRIMARY KEY ("canvasId","userId")
);

-- AddForeignKey
ALTER TABLE "canvas_collaborator"
ADD CONSTRAINT "canvas_collaborator_canvasId_fkey"
FOREIGN KEY ("canvasId") REFERENCES "canvas"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvas_collaborator"
ADD CONSTRAINT "canvas_collaborator_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "my_users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
