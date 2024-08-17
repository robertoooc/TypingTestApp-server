import { Request, Response } from 'express';
import prisma from '../prisma/index.js';
import { getCache, setCache, deleteCache } from '../utils/cache.js';

const leaderBoardCacheKey = 'leaderboard_tests';
const leaderBoardUserCacheKey = 'leaderboard_users';

const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { take = 10, skip = 0, orderBy = { wpm: 'desc' } } = req.query;

    // Calculate pagination options
    const paginationOptions = {
      take: Number(take),
      skip: Number(skip),
      orderBy: typeof orderBy === 'string' ? { [orderBy]: 'desc' } : orderBy,
    };

    // Clear cache for leaderboard
    await deleteCache(leaderBoardCacheKey);

    // Fetch leaderboard entries from cache or database
    let leaderboard = await getCache(leaderBoardCacheKey);
    if (!leaderboard) {
      leaderboard = await prisma.leaderboardEntry.findMany({
        ...paginationOptions,
        include: {
          user: {
            select: {
              name: true,
              id: true,
              wpm: true,
              profilePic: true,
            },
          },
        },
        orderBy: {
          wpm: 'desc',
        },
      });

      await setCache(leaderBoardCacheKey, leaderboard, 300);
    }

    res.status(200).json({ leaderboard });
  } catch (err: any) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserList = async (req: Request, res: Response) => {
  try {
    const { take = 10, skip = 0, orderBy = { wpm: 'desc' } } = req.query;

    // Calculate pagination options
    const paginationOptions = {
      take: Number(take),
      skip: Number(skip),
      orderBy: typeof orderBy === 'string' ? { [orderBy]: 'desc' } : orderBy,
    };

    // Fetch user list from cache or database
    let userList = await getCache(leaderBoardUserCacheKey);
    if (!userList) {
      userList = await prisma.user.findMany({
        ...paginationOptions,
        select: {
          id: true,
          name: true,
          wpm: true,
          profilePic: true,
          email: true,
          progress: true,
        },
        orderBy: {
          wpm: 'desc',
        },
      });

      await setCache(leaderBoardUserCacheKey, userList, 300);
    }

    res.status(200).json({ userList });
  } catch (err: any) {
    console.error('Error fetching user list:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getLeaderboard, getUserList };
