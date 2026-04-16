-- Make password nullable for Google OAuth users
ALTER TABLE "my_users" ALTER COLUMN "Password" DROP NOT NULL;

-- Add googleId column
ALTER TABLE "my_users" ADD COLUMN "googleId" TEXT;
ALTER TABLE "my_users" ADD CONSTRAINT "my_users_googleId_key" UNIQUE ("googleId");
