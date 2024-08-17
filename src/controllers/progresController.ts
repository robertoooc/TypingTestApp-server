import { Request, Response } from 'express';
import prisma from '../prisma/index.js';

const getProgressById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });
    res.json(progress);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const updateProgressById = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { wpm, accuracy } = req.body;
  try {
    const progress = await prisma.userProgress.upsert({
      where: { userId: user.id },
      update: {
        totalTests: { increment: 1 },
        averageWPM: { set: wpm },
        averageAccuracy: { set: accuracy },
      },
      create: {
        userId: user.id,
        totalTests: 1,
        averageWPM: wpm,
        averageAccuracy: accuracy,
      },
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user progress' });
  }
};

export { getProgressById, updateProgressById };
