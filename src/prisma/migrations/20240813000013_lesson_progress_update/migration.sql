/*
  Warnings:

  - You are about to drop the column `emphasisKey` on the `LessonProgress` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `LessonProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "emphasisKey",
ADD COLUMN     "averageAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "averageCharsTyped" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "averageWPM" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "highestAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "highestCharsTyped" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "highestWPM" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeSpent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCharsTyped" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalMistakes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalWordsTyped" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_lesson_progress_average_wpm" ON "LessonProgress"("averageWPM");

-- CreateIndex
CREATE INDEX "idx_lesson_progress_highest_wpm" ON "LessonProgress"("highestWPM");

-- CreateIndex
CREATE INDEX "idx_lesson_progress_average_accuracy" ON "LessonProgress"("averageAccuracy");

-- CreateIndex
CREATE INDEX "idx_lesson_progress_highest_accuracy" ON "LessonProgress"("highestAccuracy");
