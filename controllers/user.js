import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import config from 'config';

// Importing models
import User from '../models/userSchema';
import Book from '../models/bookSchema';

// Importing Jwt key
const JWT_KEY = config.get('JWT_KEY');

// @ Description     > Register user
// @ Route           > /users/register
// @ Access Control  > Public
export const registerUser = async (req, res, next) => {
  const { name, age, email, password } = req.body;

  if (!name || !age || !email || !password) {
    return res.status(400).json({
      msg: `Empy fields found!`,
    });
  }
  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      return res.status(409).json({
        msg: `User already exist!`,
      });
    }

    const hashedPwd = await hash(password, 12);
    if (!hashedPwd) {
      return res.status(500).json({
        msg: `Somthing went wrong in hashing the password!`,
      });
    }
    const newUser = User({
      _id: new mongoose.Types.ObjectId(),
      name,
      age,
      email,
      password: hashedPwd,
    });

    const createdUser = await newUser.save();
    if (!createdUser) {
      return res.status(500).json({
        error: `Something went wrong in adding the user!`,
      });
    }
    const token = await sign({ id: createdUser._id }, JWT_KEY, {
      expiresIn: 3600,
    });

    return res.status(201).json({
      token,
      user: { ...createdUser._doc, password: null },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// @Description     > Getting all of the users
// @Route           > /users/
// @Access Control  > Public
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ date: -1 })
      .select(' -password -__v ')
      .exec();
    if (users.length < 1) {
      return res.status(409).json({
        msg: `No users found!`,
      });
    }

    const usersList = users.map(user => ({ ...user._doc }));

    return res.status(200).json({
      users: usersList,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// @Description     > Getting users by id
// @Route           > /users/:id
// @Access Control  > Public
export const getUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ _id: userId })
      .select(' -password -__v ')
      .exec();
    if (!user) {
      return res.status(409).json({
        msg: `No user exist with this id!`,
      });
    }
    return res.status(200).json({
      user: { ...user._doc },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// @Description     > Deleting users
// @Route           > /users/:id
// @Access Control  > Private
export const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const books = await User.find({ author: userId }).exec();
    if (books.length >= 1) {
      await Book.deleteMany({ author: userId }).exec();
    }
    const user = await User.findOne({ _id: userId }).exec();
    if (!user) {
      return res.status(409).json({
        msg: `No author found!`,
      });
    }
    await User.deleteOne({ _id: userId }).exec();
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
