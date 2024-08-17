import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../prisma/index.js';
import { fetchWords, fetchWordsByEmphasis, saveWordsToDb, shuffleArray } from '../utils/wordActions.js';

// Controller to create a new lesson based on a given character
const createLesson = async (req: Request, res: Response) => {
  try {
    const { char, title, description, limit } = req.body;

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!char) {
      return res.status(400).json({ message: 'Character is required' });
    }

    // Fetch words from external API
    const words = await fetchWords(char, limit || 1000);

    // Save words to database and get word records and emphasis
    const { wordRecords, emphasis } = await saveWordsToDb(words, char);

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        words: {
          create: wordRecords.map((word: any) => ({
            word: {
              connect: { id: word.id },
            },
          })),
        },
        emphasis: {
          create: {
            emphasisId: emphasis.id,
          },
        },
      },
      include: {
        words: {
          include: {
            word: true,
          },
        },
        emphasis: {
          include: {
            emphasis: true,
          },
        },
      },
    });

    res.status(201).json({ lesson });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Controller to get a lesson by its ID
const getLessonById = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        words: {
          include: {
            word: true,
          },
        },
        emphasis: {
          include: {
            emphasis: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.status(200).json({ lesson });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Controller to get a random lesson based on an emphasis character
const getRandomLesson = async (req: Request, res: Response) => {
  try {
    const { char } = req.params;

    if (!char) {
      return res.status(400).json({ message: 'Character is required' });
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        emphasis: {
          some: {
            emphasis: {
              key: char,
            },
          },
        },
      },
      include: {
        words: {
          include: {
            word: true,
          },
        },
        emphasis: {
          include: {
            emphasis: true,
          },
        },
      },
    });

    if (lessons.length === 0) {
      return res.status(404).json({ message: 'No lessons found for the given character' });
    }

    const randomIndex = Math.floor(Math.random() * lessons.length);
    const randomLesson = lessons[randomIndex];

    res.status(200).json({ lesson: randomLesson });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const createLessonBatch = async (req: Request, res: Response) => {
  try {
    const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    const lessons = [];

    for (const char of chars) {
      const words = await fetchWords(char, 200);
      const { wordRecords, emphasis } = await saveWordsToDb(words, char);

      const lesson = await prisma.lesson.create({
        data: {
          title: `${char.toUpperCase()} Lesson`,
          description: `A lesson for character ${char}`,
          words: {
            create: wordRecords.map((word: any) => ({
              word: {
                connect: { id: word.id },
              },
            })),
          },
          emphasis: {
            create: {
              emphasisId: emphasis.id,
            },
          },
        },
        include: {
          words: {
            include: {
              word: true,
            },
          },
          emphasis: {
            include: {
              emphasis: true,
            },
          },
        },
      });

      lessons.push(lesson);
      console.log(`Lesson created for character ${char}`);
    }
    res.status(201).json({ lessons });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const createLessonFromShuffledWords = async (req: Request, res: Response) => {
  try {
    const { char } = req.body;
    if (!char) return res.status(400).json({ message: 'Character is required' });

    // Fetch words by emphasis
    const words = await fetchWordsByEmphasis(char);
    const shuffledWords = shuffleArray(words).slice(0, 200);

    // Ensure emphasis exists or create it
    let emphasis = await prisma.emphasis.findUnique({
      where: { key: char },
    });

    if (!emphasis) {
      emphasis = await prisma.emphasis.create({
        data: { key: char },
      });
    }

    // Create lesson without emphasis relation initially
    const createdLesson = await prisma.lesson.create({
      data: {
        title: `${char.toUpperCase()} Lesson`,
        description: `A lesson for character ${char}`,
        words: {
          create: shuffledWords.map((word: any) => ({
            word: {
              connect: { id: word.id },
            },
          })),
        },
      },
      include: {
        words: {
          include: {
            word: true,
          },
        },
      },
    });

    // Create LessonEmphasis record to establish the relationship
    await prisma.lessonEmphasis.create({
      data: {
        lessonId: createdLesson.id,
        emphasisId: emphasis.id,
      },
    });

    res.status(201).json({ lesson: createdLesson });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export { createLesson, getLessonById, getRandomLesson, createLessonBatch, createLessonFromShuffledWords };
