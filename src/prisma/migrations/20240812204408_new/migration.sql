-- CreateTable
CREATE TABLE "ResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "profilePic" TEXT,
    "bio" TEXT,
    "wpm" INTEGER NOT NULL DEFAULT 0,
    "googleOAuth" BOOLEAN NOT NULL DEFAULT false,
    "guest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "averageWPM" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "WPM" INTEGER NOT NULL DEFAULT 0,
    "topWPMInterval" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageCharactersTyped" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCharactersTyped" INTEGER NOT NULL DEFAULT 0,
    "totalWordsTyped" INTEGER NOT NULL DEFAULT 0,
    "totalMistakes" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "emphasisKey" TEXT NOT NULL,
    "testsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wpm" INTEGER NOT NULL,
    "topWPMInterval" INTEGER NOT NULL,
    "topAccuracy" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "totalChars" INTEGER NOT NULL,
    "mistakesAmt" INTEGER NOT NULL,
    "testId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "wpm" INTEGER NOT NULL,
    "totalChars" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "topWPMInterval" INTEGER NOT NULL,
    "topAccuracyInterval" DOUBLE PRECISION NOT NULL,
    "topCharactersTypedInterval" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordId" TEXT,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL,
    "expectedChar" TEXT NOT NULL,
    "typedChar" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "testId" TEXT NOT NULL,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntervalWordData" (
    "id" TEXT NOT NULL,
    "timeFrame" INTEGER NOT NULL,
    "wordsTyped" INTEGER NOT NULL,
    "charactersTyped" INTEGER NOT NULL,
    "mistakes" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "testId" TEXT NOT NULL,

    CONSTRAINT "IntervalWordData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonWord" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "LessonWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emphasis" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "Emphasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonEmphasis" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "emphasisId" TEXT NOT NULL,

    CONSTRAINT "LessonEmphasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordEmphasis" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "emphasisId" TEXT NOT NULL,

    CONSTRAINT "WordEmphasis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_token_key" ON "ResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_email_key" ON "ResetToken"("email");

-- CreateIndex
CREATE INDEX "idx_reset_token_token" ON "ResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_name" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE INDEX "idx_user_progress_user_id" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_key" ON "LessonProgress"("userId");

-- CreateIndex
CREATE INDEX "idx_lesson_progress_user_id" ON "LessonProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_testId_key" ON "LeaderboardEntry"("testId");

-- CreateIndex
CREATE INDEX "idx_leaderboard_entry_user_id" ON "LeaderboardEntry"("userId");

-- CreateIndex
CREATE INDEX "idx_test_user_id" ON "Test"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_text_key" ON "Word"("text");

-- CreateIndex
CREATE UNIQUE INDEX "Emphasis_key_key" ON "Emphasis"("key");

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntervalWordData" ADD CONSTRAINT "IntervalWordData_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonWord" ADD CONSTRAINT "LessonWord_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonWord" ADD CONSTRAINT "LessonWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonEmphasis" ADD CONSTRAINT "LessonEmphasis_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonEmphasis" ADD CONSTRAINT "LessonEmphasis_emphasisId_fkey" FOREIGN KEY ("emphasisId") REFERENCES "Emphasis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordEmphasis" ADD CONSTRAINT "WordEmphasis_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordEmphasis" ADD CONSTRAINT "WordEmphasis_emphasisId_fkey" FOREIGN KEY ("emphasisId") REFERENCES "Emphasis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
