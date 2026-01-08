-- DropForeignKey
ALTER TABLE "ProjectStar" DROP CONSTRAINT "ProjectStar_projectId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectStar" ADD CONSTRAINT "ProjectStar_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
