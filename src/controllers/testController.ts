import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../prisma/index.js';
import { deleteCache } from '../utils/cache.js';

const getTestById = async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true,
          },
        },
        mistakes: true,
        intervalData: true,
      },
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ test });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const createTest = async (req: Request, res: Response) => {
  try {
    const { wpm, accuracy, text, mistakes, duration, totalChars, intervalData, lessonIds } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const concatenatedErrors = errors.array().map((error) => error.msg);
      return res.status(400).json({ message: concatenatedErrors });
    }

    // Find user
    let user = await prisma.user.findUnique({
      where: {
        id: res.locals.user.id,
      },
      include: {
        progress: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let topWPMInterval = 0,
      topAccuracyInterval = 0,
      topCharactersTypedInterval = 0;

    intervalData.forEach((data: any) => {
      topWPMInterval = Math.max(topWPMInterval, data.wordsTyped);
      topAccuracyInterval = Math.max(topAccuracyInterval, data.accuracy);
      topCharactersTypedInterval = Math.max(topCharactersTypedInterval, data.charactersTyped);
    });

    // Create new test
    const newTest = await prisma.test.create({
      data: {
        wpm,
        totalChars,
        accuracy,
        text,
        duration,
        topWPMInterval,
        topAccuracyInterval,
        topCharactersTypedInterval,
        user: {
          connect: {
            id: user.id,
          },
        },
        mistakes: {
          create: mistakes,
        },
        intervalData: {
          create: intervalData,
        },
        leaderboardEntries: {
          create: {
            wpm,
            accuracy,
            totalChars,
            mistakesAmt: mistakes.length,
            topWPMInterval,
            topAccuracy: topAccuracyInterval,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
        lessons: {
          create: lessonIds.map((lessonId: string) => ({
            lesson: {
              connect: { id: lessonId },
            },
          })),
        },
      },
      include: {
        user: true,
        mistakes: true,
        intervalData: true,
        leaderboardEntries: true,
        lessons: true,
      },
    });

    // Update user's WPM if new test has improved WPM
    if (user.wpm < wpm) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          wpm,
        },
      });
    }

    // Calculate
    const totalWordsTyped = (user?.progress?.totalWordsTyped || 0) + wpm;
    const totalMistakes = (user?.progress?.totalMistakes || 0) + mistakes.length;
    const totalCharactersTyped = (user?.progress?.totalCharactersTyped || 0) + totalChars;
    const totalDuration = (user?.progress?.totalDuration || 0) + duration;
    const totalTests = (user?.progress?.totalTests || 0) + 1;
    const topAccuracy = Math.max(user?.progress?.averageAccuracy || 0, accuracy);
    const newWPM = Math.max(user?.progress?.WPM || 0, wpm);

    // Update or initialize user progress
    const progress = await updateOrInitializeProgress(
      user.id,
      newTest,
      accuracy,
      topWPMInterval,
      totalWordsTyped,
      totalMistakes,
      totalCharactersTyped,
      totalDuration,
      totalTests,
      topAccuracy,
      newWPM
    );

    // Update lesson progress
    const lessonProgress = await updateLessonProgress(user.id, lessonIds, wpm, accuracy, totalChars, duration, mistakes.length);

    await deleteCache('leaderboard_tests');
    await deleteCache('leaderboard_users');

    if (newTest.user.password) delete (newTest.user as any).password;

    res.status(201).json({ newTest, progress, lessonProgress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOrInitializeProgress = async (
  userId: string,
  newTest: any,
  accuracy: number,
  topWPMInterval: number,
  totalWordsTyped: number,
  totalMistakes: number,
  totalCharactersTyped: number,
  totalDuration: number,
  totalTests: number,
  topAccuracy: number,
  WPM: number
) => {
  try {
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (existingProgress) {
      const newAverageWPM = Number(((existingProgress.averageWPM * existingProgress.totalTests + newTest.wpm) / totalTests).toFixed(2));
      const newAverageAccuracy = Number((((existingProgress.averageAccuracy || 100) * existingProgress.totalTests + accuracy) / totalTests).toFixed(2));
      const newAverageCharactersTyped = Number((totalCharactersTyped / totalTests).toFixed(2));

      return prisma.userProgress.update({
        where: { userId },
        data: {
          totalTests,
          averageWPM: newAverageWPM,
          averageAccuracy: newAverageAccuracy,
          topWPMInterval: Math.max(existingProgress.topWPMInterval, topWPMInterval),
          totalCharactersTyped,
          totalWordsTyped,
          totalMistakes,
          totalDuration,
          WPM,
          averageCharactersTyped: newAverageCharactersTyped,
          topAccuracy,
        },
      });
    } else {
      return prisma.userProgress.create({
        data: {
          userId,
          totalTests,
          averageWPM: newTest.wpm,
          averageAccuracy: accuracy,
          topWPMInterval,
          totalCharactersTyped,
          totalWordsTyped,
          totalMistakes,
          totalDuration,
          averageCharactersTyped: totalCharactersTyped,
          WPM,
          topAccuracy,
        },
      });
    }
  } catch (err) {
    console.error('Error updating user progress:', err);
    throw new Error('Failed to update user progress');
  }
};

const updateLessonProgress = async (userId: string, lessonIds: string[], wpm: number, accuracy: number, totalChars: number, timeSpent: number, mistakes: number) => {
  try {
    // Find existing lesson progress records
    const existingLessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: {
          in: lessonIds,
        },
      },
    });

    const existingLessonIds = existingLessonProgress.map((lp) => lp.lessonId);
    const newLessonIds = lessonIds.filter((id) => !existingLessonIds.includes(id));

    // Create new lesson progress records for lessons not yet in the database
    if (newLessonIds.length > 0) {
      await prisma.lessonProgress.createMany({
        data: newLessonIds.map((id) => ({
          userId,
          lessonId: id,
          totalTests: 1,
          timeSpent,
          averageWPM: wpm,
          highestWPM: wpm,
          totalWordsTyped: wpm,
          averageAccuracy: accuracy,
          highestAccuracy: accuracy,
          totalCharsTyped: totalChars,
          averageCharsTyped: totalChars,
          highestCharsTyped: totalChars,
          totalMistakes: mistakes,
        })),
      });
    }

    // Update existing lesson progress records
    if (existingLessonProgress.length > 0) {
      await Promise.all(
        existingLessonProgress.map(async (progress) => {
          const newTotalTests = progress.totalTests + 1;
          const newAverageWPM = Number(((progress.averageWPM * progress.totalTests + wpm) / newTotalTests).toFixed(2));
          const newAverageAccuracy = Number(((progress.averageAccuracy * progress.totalTests + accuracy) / newTotalTests).toFixed(2));
          const newAverageCharsTyped = Number(((progress.averageCharsTyped * progress.totalTests + totalChars) / newTotalTests).toFixed(2));

          await prisma.lessonProgress.update({
            where: {
              id: progress.id,
            },
            data: {
              totalTests: { increment: 1 },
              timeSpent: { increment: timeSpent },
              averageWPM: newAverageWPM,
              highestWPM: Math.max(progress.highestWPM, wpm),
              totalWordsTyped: { increment: wpm },
              averageAccuracy: newAverageAccuracy,
              highestAccuracy: Math.max(progress.highestAccuracy, accuracy),
              totalCharsTyped: { increment: totalChars },
              averageCharsTyped: newAverageCharsTyped,
              highestCharsTyped: Math.max(progress.highestCharsTyped, totalChars),
              totalMistakes: { increment: mistakes },
            },
          });
        })
      );
    }

    return prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: {
          in: lessonIds,
        },
      },
    });
  } catch (err) {
    console.error('Error updating lesson progress:', err);
    throw new Error('Failed to update lesson progress');
  }
};

export { getTestById, createTest };
