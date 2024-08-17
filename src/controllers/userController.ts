import { Request, Response } from 'express';
import prisma from '../prisma/index.js';
import { getCache, setCache, deleteCache } from '../utils/cache.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt, checkToken } from './passwordController.js';
import dispatchEmails from '../utils/dispatchEmails.js';
import { validationResult } from 'express-validator';
import moment from 'moment-timezone';

const tokenExpirationTime = 60 * 60 * 1000; // 1 hour in milliseconds

const AWS_REGION = process.env.AWS_REGION as string;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
const AWS_ENDPOINT = process.env.AWS_ENDPOINT as string;
const AWS_BUCKET = process.env.AWS_BUCKET as string;
const SUPABASE_URL = process.env.SUPABASE_URL as string;

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  endpoint: AWS_ENDPOINT,
});

//getUser
const getUser = async (req: Request, res: Response) => {
  try {
    const cachedUser = await getCache(`user_${res.locals.user.id}`);
    if (cachedUser) {
      return res.status(200).json(cachedUser);
    }

    const findUser = await prisma.user.findUnique({
      where: {
        id: res.locals.user.id,
      },
      include: {
        tests: true,
        progress: true,
      },
    });

    if (!findUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (findUser.password) delete (findUser as any).password;

    await setCache(`user_${res.locals.user.id}`, findUser);

    return res.status(200).json(findUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const findUser = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        tests: {
          include: {
            mistakes: true,
            intervalData: true,
          },
        },
        progress: true,
      },
    });

    if (!findUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // removing for privacy
    if (findUser.password) delete (findUser as any).password;

    if (findUser.email) delete (findUser as any).email;

    await setCache(`user_${res.locals.user.id}`, findUser);

    return res.status(200).json(findUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

//deleteUserById
const deleteUserById = async (req: Request, res: Response) => {
  try {
    const deleteUser = await prisma.user.delete({
      where: {
        id: res.locals.user.id,
      },
    });

    if (!deleteUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await deleteCache(`user_${res.locals.user.id}`);

    const cookieOptions = {
      expires: new Date(Date.now()),
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: false,
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
      cookieOptions.sameSite = false;
    }

    res.clearCookie('jwt', cookieOptions);

    return res.status(200).json({ message: 'user deleted', deleteUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

//updateUserById
const updateUserById = async (req: Request, res: Response) => {
  try {
    const findUser = await prisma.user.findUnique({
      where: {
        id: res.locals.user.id,
      },
    });

    if (!findUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: res.locals.user.id,
      },
      data: {
        name,
        bio,
      },
    });

    if (updatedUser.password) delete (updatedUser as any).password;

    await deleteCache(`user_${res.locals.user.id}`);

    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const uploadProfilePic = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { id } = res.locals.user;

    const compressedImg = await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'inside',
      })
      .webp({ quality: 60 })
      .toBuffer();

    const MAX_SIZE_KB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

    if (compressedImg.byteLength > MAX_SIZE_BYTES) {
      return res.status(400).json({ message: 'File too large' });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        profilePic: true,
      },
    });

    if (existingUser?.profilePic) {
      const existingProfilePicKey = existingUser.profilePic.replace(`${SUPABASE_URL}/${AWS_BUCKET}/`, '');
      const deleteParams = {
        Bucket: AWS_BUCKET,
        Key: existingProfilePicKey,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    }

    const lastDot = file.originalname.lastIndexOf('.');
    const fileName = lastDot === -1 ? file.originalname : file.originalname.slice(0, lastDot);

    const newFileName = `${fileName}-${uuidv4()}.webp`;

    const uploadParams = {
      Bucket: AWS_BUCKET,
      Key: `${id}/${newFileName}`,
      Body: compressedImg,
      ContentType: 'image/webp',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const url = `${SUPABASE_URL}/${AWS_BUCKET}/${id}/${newFileName}`;

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        profilePic: url,
      },
    });

    await deleteCache(`user_${res.locals.user.id}`);

    res.status(200).json({ url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProfilePic = async (req: Request, res: Response) => {
  try {
    const { id } = res.locals.user;

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        profilePic: true,
      },
    });

    if (!existingUser?.profilePic) {
      return res.status(404).json({ message: 'No profile picture found' });
    }

    const existingProfilePicKey = existingUser.profilePic.replace(`${SUPABASE_URL}/${AWS_BUCKET}/`, '');
    const deleteParams = {
      Bucket: AWS_BUCKET,
      Key: existingProfilePicKey,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        profilePic: null,
      },
    });

    await deleteCache(`user_${res.locals.user.id}`);

    res.status(200).json({ message: 'Profile picture deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const requestEmailUpdate = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: res.locals.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'Cannot change email' });
    }

    const encryptedEmail = encrypt(user.email);

    await prisma.resetToken.deleteMany({
      where: {
        email: encryptedEmail,
      },
    });

    const token = uuidv4();
    const url = `${process.env.CLIENT_URI}/email/update/${token}`;

    const expiration = moment().tz('America/Los_Angeles').add(tokenExpirationTime, 'milliseconds').toDate();

    await prisma.resetToken.create({
      data: { token, expiration, email: encryptedEmail },
    });

    const subject = 'Email Update Request';
    const message = `Click <a href=${url}>here</a> to update your email address.`;

    dispatchEmails({ recipient: user.email, subject, message });

    res.status(200).json({ message: 'Email update link sent' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const updateEmail = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { token, newEmail } = req.body;
    const isValid = await checkToken(token);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const decryptedEmail = decrypt(isValid.email);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: newEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    await prisma.user.update({
      where: {
        email: decryptedEmail,
      },
      data: {
        email: newEmail,
      },
    });

    await prisma.resetToken.delete({
      where: {
        token,
      },
    });

    await deleteCache(`user_${res.locals.user.id}`);

    res.status(200).json({ message: 'Email updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export { getUser, getUserById, updateUserById, deleteUserById, uploadProfilePic, deleteProfilePic, requestEmailUpdate, updateEmail };
