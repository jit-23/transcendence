-- Add user blocking table
CREATE TABLE "user_block" (
    "id" SERIAL PRIMARY KEY,
    "blockerId" INTEGER NOT NULL,
    "blockedId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_block_blockerId_fkey"
        FOREIGN KEY ("blockerId") REFERENCES "my_users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_block_blockedId_fkey"
        FOREIGN KEY ("blockedId") REFERENCES "my_users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "user_block_blockerId_blockedId_key"
    ON "user_block"("blockerId", "blockedId");

CREATE INDEX "user_block_blockerId_idx"
    ON "user_block"("blockerId");

CREATE INDEX "user_block_blockedId_idx"
    ON "user_block"("blockedId");
