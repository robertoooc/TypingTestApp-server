import { Request, Response } from 'express';
import User from '../models/User.js';
import { genSaltSync, hashSync, compareSync } from 'bcrypt-ts';
import jwt from 'jsonwebtoken';

declare var process: {
  env: {
    JWT_SECRET: string;
  };
};

//getUserById
const getUserById = async (req: Request, res: Response) => {
  try {
    const findUser = await User.findById(res.locals.user._id).populate('tests');
    if (findUser) {
      return res.status(200).json(findUser);
    } else {
      return res.status(404).json({ message: ' User not found ' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

//deleteUserById
const deleteUserById = async (req: Request, res: Response) => {
  try {
    const deleteUser = await User.findOneAndDelete({
      _id: res.locals.user._id,
    });
    if (!deleteUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'user deleted', deleteUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

//updateUserById - change password
const updateUserById = async (req: Request, res: Response) => {
  try {
    const findUser = await User.findById(res.locals.user._id);

    if (!findUser) return res.status(404).json({ message: 'User not Found' });

    const comparePassword = await compareSync(
      req.body.oldPassword,
      findUser.password
    );

    if (!comparePassword)
      return res.status(400).json({ message: 'Wrong password' });

    const newPassword: string = req.body.newPassword;
    const saltRounds: number = 12;
    const salt = genSaltSync(saltRounds);
    const hashedPassword = hashSync(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(findUser.id, {
      password: hashedPassword,
    });

    if (!updatedUser)
      return res.status(500).json({ message: 'Error updating' });

    const jwtPayload: { name: string; email: string; id: string } = {
      name: updatedUser.name,
      email: updatedUser.email,
      id: updatedUser.id,
    };

    const secret = process.env.JWT_SECRET;
    const token = await jwt.sign(jwtPayload, secret);

    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export { getUserById, updateUserById, deleteUserById };
