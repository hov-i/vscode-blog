-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Guestbook_userId_idx" ON "Guestbook"("userId");

-- CreateIndex
CREATE INDEX "Post_views_idx" ON "Post"("views" DESC);

-- CreateIndex
CREATE INDEX "Project_title_idx" ON "Project"("title");
