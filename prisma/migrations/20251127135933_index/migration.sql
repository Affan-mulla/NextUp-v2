-- DropForeignKey
ALTER TABLE "Ideas" DROP CONSTRAINT "Ideas_userId_fkey";

-- CreateIndex
CREATE INDEX "CommentVotes_userId_type_idx" ON "CommentVotes"("userId", "type");

-- CreateIndex
CREATE INDEX "CommentVotes_commentId_type_idx" ON "CommentVotes"("commentId", "type");

-- CreateIndex
CREATE INDEX "CommentVotes_createdAt_idx" ON "CommentVotes"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Comments_userId_idx" ON "Comments"("userId");

-- CreateIndex
CREATE INDEX "Comments_ideaId_idx" ON "Comments"("ideaId");

-- CreateIndex
CREATE INDEX "Comments_postId_idx" ON "Comments"("postId");

-- CreateIndex
CREATE INDEX "Comments_createdAt_idx" ON "Comments"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Ideas_userId_idx" ON "Ideas"("userId");

-- CreateIndex
CREATE INDEX "Ideas_createdAt_idx" ON "Ideas"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Votes_userId_type_idx" ON "Votes"("userId", "type");

-- CreateIndex
CREATE INDEX "Votes_ideaId_type_idx" ON "Votes"("ideaId", "type");

-- CreateIndex
CREATE INDEX "Votes_createdAt_idx" ON "Votes"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "product_name_idx" ON "product"("name");

-- CreateIndex
CREATE INDEX "product_description_idx" ON "product"("description");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- AddForeignKey
ALTER TABLE "Ideas" ADD CONSTRAINT "Ideas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
