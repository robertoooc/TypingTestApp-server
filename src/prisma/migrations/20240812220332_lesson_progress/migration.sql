/*
  Warnings:

  - You are about to drop the column `testsCompleted` on the `LessonProgress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,lessonId]` on the table `LessonProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LessonProgress_userId_key";

-- DropIndex
DROP INDEX "idx_lesson_progress_user_id";

-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "testsCompleted";

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");
