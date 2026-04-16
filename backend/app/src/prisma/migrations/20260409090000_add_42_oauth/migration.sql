-- Add nullable 42 OAuth identifier for account linking and login
ALTER TABLE "my_users"
ADD COLUMN "fortyTwoId" TEXT;

CREATE UNIQUE INDEX "my_users_fortyTwoId_key"
ON "my_users"("fortyTwoId");
