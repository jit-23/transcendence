-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "Name" VARCHAR(20) NOT NULL,
    "Password" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Name_key" ON "User"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "User_Password_key" ON "User"("Password");
