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

    // Update or initialize user progress
    const progress = await updateOrInitializeProgress(user.id, accuracy, topWPMInterval, mistakes.length, totalChars, duration, accuracy, wpm);

    // Update lesson progress
    const lessonProgress = await updateLessonProgress(user.id, lessonIds, wpm, accuracy, totalChars, duration, mistakes.length);

    await deleteCache('leaderboard_tests');
    await deleteCache('leaderboard_users');

    if (newTest.user.password) delete (newTest.user as any).password;

    res.status(201).json({ test: newTest, userProgress: progress, lessonProgress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOrInitializeProgress = async (
  userId: string,
  accuracy: number,
  topWPMInterval: number,
  totalMistakes: number,
  totalCharactersTyped: number,
  totalDuration: number,
  topAccuracy: number,
  WPM: number
) => {
  try {
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    let updatedProgress;

    if (existingProgress) {
      const newTotalTests = existingProgress.totalTests + 1;
      const newAverageWPM = Number(((existingProgress.averageWPM * existingProgress.totalTests + WPM) / newTotalTests).toFixed(2));
      const newAverageAccuracy = Number((((existingProgress.averageAccuracy || 100) * existingProgress.totalTests + accuracy) / newTotalTests).toFixed(2));
      const newAverageCharactersTyped = Number((((existingProgress.averageCharactersTyped || 0) * existingProgress.totalTests + totalCharactersTyped) / newTotalTests).toFixed(2));

      updatedProgress = await prisma.userProgress.update({
        where: { userId },
        data: {
          totalTests: newTotalTests,
          averageWPM: newAverageWPM,
          averageAccuracy: newAverageAccuracy,
          topWPMInterval: Math.max(existingProgress.topWPMInterval, topWPMInterval),
          totalCharactersTyped: existingProgress.totalCharactersTyped + totalCharactersTyped,
          totalWordsTyped: existingProgress.totalWordsTyped + WPM,
          totalMistakes: existingProgress.totalMistakes + totalMistakes,
          totalDuration: existingProgress.totalDuration + totalDuration,
          WPM: Math.max(existingProgress.WPM, WPM),
          averageCharactersTyped: newAverageCharactersTyped,
          topAccuracy: Math.max(existingProgress.topAccuracy, topAccuracy),
        },
      });
    } else {
      updatedProgress = await prisma.userProgress.create({
        data: {
          userId,
          totalTests: 1,
          averageWPM: WPM,
          averageAccuracy: accuracy,
          topWPMInterval,
          totalCharactersTyped,
          totalWordsTyped: WPM,
          totalMistakes,
          totalDuration,
          averageCharactersTyped: totalCharactersTyped,
          WPM,
          topAccuracy,
        },
      });
    }

    // Calculate improvements only for client-side display not for database
    const improvementDetails = {
      totalTests: {
        improvement: existingProgress ? existingProgress.totalTests < updatedProgress.totalTests : true,
        value: updatedProgress.totalTests,
        prevValue: existingProgress?.totalTests || 0,
      },
      averageWPM: {
        improvement: existingProgress ? updatedProgress.averageWPM > existingProgress.averageWPM : true,
        value: updatedProgress.averageWPM,
        prevValue: existingProgress?.averageWPM || 0,
      },
      averageAccuracy: {
        improvement: existingProgress ? updatedProgress.averageAccuracy > existingProgress.averageAccuracy : true,
        value: updatedProgress.averageAccuracy,
        prevValue: existingProgress?.averageAccuracy || 0,
      },
      topWPMInterval: {
        improvement: existingProgress ? updatedProgress.topWPMInterval > existingProgress.topWPMInterval : true,
        value: updatedProgress.topWPMInterval,
        prevValue: existingProgress?.topWPMInterval || 0,
      },
      totalCharactersTyped: {
        improvement: existingProgress ? updatedProgress.totalCharactersTyped > existingProgress.totalCharactersTyped : true,
        value: updatedProgress.totalCharactersTyped,
        prevValue: existingProgress?.totalCharactersTyped || 0,
      },
      totalWordsTyped: {
        improvement: existingProgress ? updatedProgress.totalWordsTyped > existingProgress.totalWordsTyped : true,
        value: updatedProgress.totalWordsTyped,
        prevValue: existingProgress?.totalWordsTyped || 0,
      },
      totalMistakes: {
        improvement: existingProgress ? updatedProgress.totalMistakes < existingProgress.totalMistakes : true,
        value: updatedProgress.totalMistakes,
        prevValue: existingProgress?.totalMistakes || 0,
      },
      totalDuration: {
        improvement: existingProgress ? updatedProgress.totalDuration > existingProgress.totalDuration : true,
        value: updatedProgress.totalDuration,
        prevValue: existingProgress?.totalDuration || 0,
      },
      WPM: {
        improvement: existingProgress ? updatedProgress.WPM > existingProgress.WPM : true,
        value: updatedProgress.WPM,
        prevValue: existingProgress?.WPM || 0,
      },
      averageCharactersTyped: {
        improvement: existingProgress ? updatedProgress.averageCharactersTyped > existingProgress.averageCharactersTyped : true,
        value: updatedProgress.averageCharactersTyped,
        prevValue: existingProgress?.averageCharactersTyped || 0,
      },
      topAccuracy: {
        improvement: existingProgress ? updatedProgress.topAccuracy > existingProgress.topAccuracy : true,
        value: updatedProgress.topAccuracy,
        prevValue: existingProgress?.topAccuracy || 0,
      },
    };

    return { updatedProgress, improvements: improvementDetails };
  } catch (err) {
    console.error('Error updating user progress:', err);
    throw new Error('Failed to update user progress');
  }
};

const updateLessonProgress = async (userId: string, lessonIds: string[], wpm: number, accuracy: number, totalChars: number, timeSpent: number, mistakes: number) => {
  try {
    // Fetch existing lesson progress
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

    // Fetch all lesson progress records again to include both new and updated records
    const allLessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: {
          in: lessonIds,
        },
      },
    });

    // Update existing lesson progress records
    const updatePromises = allLessonProgress.map(async (progress) => {
      const isExisting = existingLessonIds.includes(progress.lessonId);

      // If it's an existing record, update the metrics
      const newTotalTests = isExisting ? progress.totalTests + 1 : 1;
      const newAverageWPM = isExisting ? Number(((progress.averageWPM * progress.totalTests + wpm) / newTotalTests).toFixed(2)) : wpm;
      const newAverageAccuracy = isExisting ? Number(((progress.averageAccuracy * progress.totalTests + accuracy) / newTotalTests).toFixed(2)) : accuracy;
      const newAverageCharsTyped = isExisting ? Number(((progress.averageCharsTyped * progress.totalTests + totalChars) / newTotalTests).toFixed(2)) : totalChars;

      // Calculate the new values correctly
      const updatedTimeSpent = isExisting ? progress.timeSpent + timeSpent : timeSpent;
      const updatedTotalWordsTyped = isExisting ? progress.totalWordsTyped + wpm : wpm;
      const updatedTotalCharsTyped = isExisting ? progress.totalCharsTyped + totalChars : totalChars;

      // Update the database records
      await prisma.lessonProgress.update({
        where: { id: progress.id },
        data: {
          totalTests: newTotalTests,
          timeSpent: updatedTimeSpent,
          averageWPM: newAverageWPM,
          highestWPM: Math.max(progress.highestWPM, wpm),
          totalWordsTyped: updatedTotalWordsTyped,
          averageAccuracy: newAverageAccuracy,
          highestAccuracy: Math.max(progress.highestAccuracy, accuracy),
          totalCharsTyped: updatedTotalCharsTyped,
          averageCharsTyped: newAverageCharsTyped,
          highestCharsTyped: Math.max(progress.highestCharsTyped, totalChars),
          totalMistakes: isExisting ? progress.totalMistakes + mistakes : mistakes,
        },
      });

      // Calculate improvement information for return value
      return {
        ...progress,
        totalTests: {
          improvement: !isExisting || newTotalTests > progress.totalTests,
          value: newTotalTests,
          prevValue: isExisting ? progress.totalTests : 0,
        },
        timeSpent: {
          improvement: !isExisting || updatedTimeSpent > progress.timeSpent,
          value: updatedTimeSpent,
          prevValue: isExisting ? progress.timeSpent : 0,
        },
        averageWPM: {
          improvement: !isExisting || newAverageWPM > progress.averageWPM,
          value: newAverageWPM,
          prevValue: isExisting ? progress.averageWPM : 0,
        },
        highestWPM: {
          improvement: !isExisting || wpm > progress.highestWPM,
          value: Math.max(progress.highestWPM, wpm),
          prevValue: isExisting ? progress.highestWPM : 0,
        },
        totalWordsTyped: {
          improvement: !isExisting || updatedTotalWordsTyped > progress.totalWordsTyped,
          value: updatedTotalWordsTyped,
          prevValue: isExisting ? progress.totalWordsTyped : 0,
        },
        averageAccuracy: {
          improvement: !isExisting || newAverageAccuracy > progress.averageAccuracy,
          value: newAverageAccuracy,
          prevValue: isExisting ? progress.averageAccuracy : 0,
        },
        highestAccuracy: {
          improvement: !isExisting || accuracy > progress.highestAccuracy,
          value: Math.max(progress.highestAccuracy, accuracy),
          prevValue: isExisting ? progress.highestAccuracy : 0,
        },
        totalCharsTyped: {
          improvement: !isExisting || updatedTotalCharsTyped > progress.totalCharsTyped,
          value: updatedTotalCharsTyped,
          prevValue: isExisting ? progress.totalCharsTyped : 0,
        },
        averageCharsTyped: {
          improvement: !isExisting || newAverageCharsTyped > progress.averageCharsTyped,
          value: newAverageCharsTyped,
          prevValue: isExisting ? progress.averageCharsTyped : 0,
        },
        highestCharsTyped: {
          improvement: !isExisting || totalChars > progress.highestCharsTyped,
          value: Math.max(progress.highestCharsTyped, totalChars),
          prevValue: isExisting ? progress.highestCharsTyped : 0,
        },
        totalMistakes: {
          improvement: !isExisting || progress.totalMistakes + mistakes > progress.totalMistakes,
          value: isExisting ? progress.totalMistakes + mistakes : mistakes,
          prevValue: isExisting ? progress.totalMistakes : 0,
        },
      };
    });

    // Wait for all update operations to complete
    const updatedLessonProgress = await Promise.all(updatePromises);

    // Return the updated lesson progress data with improvements
    return updatedLessonProgress;
  } catch (err) {
    console.error('Error updating lesson progress:', err);
    throw new Error('Failed to update lesson progress');
  }
};

export { getTestById, createTest };
