-- CreateTable
CREATE TABLE "TestLesson" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestLesson_testId_lessonId_key" ON "TestLesson"("testId", "lessonId");

-- CreateIndex
CREATE INDEX "idx_lesson_progress_user_id" ON "LessonProgress"("userId");

-- AddForeignKey
ALTER TABLE "TestLesson" ADD CONSTRAINT "TestLesson_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestLesson" ADD CONSTRAINT "TestLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
