import axios from 'axios';
import prisma from '../prisma/index.js';

const isValidWord = (word: any) => {
  const validCharRegex = /^[A-Za-z\s]+$/; // Allows only English letters and spaces
  return validCharRegex.test(word) && !/[^\x00-\x7F]/.test(word); // Ensure no non-ASCII characters
};

const fetchWords = async (char: string, limit: number) => {
  try {
    const URL = `${process.env.DICTIONARY_URL}?sp=${char}*&max=${limit}`;
    const response = await axios.get(URL);
    const words = response.data.map((word: any) => word.word).filter(isValidWord);
    return words;
  } catch (err) {
    console.log(err);
    throw new Error('Error fetching words');
  }
};

// Helper function to save words to the database
const saveWordsToDb = async (words: string[], emphasisKey: string) => {
  try {
    // Create or find the emphasis
    let emphasis = await prisma.emphasis.findUnique({
      where: { key: emphasisKey },
    });

    if (!emphasis) {
      emphasis = await prisma.emphasis.create({
        data: { key: emphasisKey },
      });
    }

    // Ensure emphasis exists before proceeding
    if (!emphasis) {
      throw new Error('Failed to create or find emphasis');
    }

    // Create an array of word objects to bulk insert
    const wordObjects = words.map((word) => ({ text: word }));

    // Bulk insert words if they don't already exist
    await prisma.word.createMany({
      data: wordObjects,
      skipDuplicates: true,
    });

    // Fetch all the inserted words
    const wordRecords = await prisma.word.findMany({
      where: {
        text: {
          in: words,
        },
      },
    });

    // Ensure wordRecords is not null or empty
    if (!wordRecords || wordRecords.length === 0) {
      throw new Error('Failed to fetch inserted words');
    }

    const emphasisId = emphasis.id;
    // Create an array of word-emphasis connections
    const wordEmphasisConnections = wordRecords.map((wordRecord: any) => ({
      wordId: wordRecord.id,
      emphasisId: emphasisId,
    }));

    // Bulk insert word-emphasis connections if they don't already exist
    await prisma.wordEmphasis.createMany({
      data: wordEmphasisConnections,
      skipDuplicates: true,
    });
    return { wordRecords, emphasis };
  } catch (error) {
    console.error('Error saving words to DB:', error);
    throw new Error('Error saving words to DB');
  }
};

const fetchWordsByEmphasis = async (emphasisKey: string): Promise<any> => {
  try {
    const emphasis = await prisma.emphasis.findUnique({
      where: { key: emphasisKey },
      include: {
        words: {
          select: {
            word: true,
          },
        },
      },
    });

    if (!emphasis) {
      throw new Error(`Emphasis with key ${emphasisKey} not found`);
    }

    // Extract text from word objects
    const words = emphasis.words.map((word: any) => word.word);

    return words;
  } catch (error) {
    console.error('Error fetching words by emphasis:', error);
    throw new Error('Error fetching words by emphasis');
  }
};

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export { fetchWords, saveWordsToDb, fetchWordsByEmphasis, shuffleArray };
