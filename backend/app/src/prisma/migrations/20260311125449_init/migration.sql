-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(20) NOT NULL UNIQUE,
    "Email" VARCHAR(50) NOT NULL UNIQUE,
    "Password" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "twoFactorSecret" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Name_key" ON "User"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "User_Password_key" ON "User"("Password");
