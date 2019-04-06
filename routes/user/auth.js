import { Router } from 'express';
import mongoose from 'mongoose';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import config from 'config';

// Importing models
import User from '../../models/userSchema';

// Importing auth middleware
import isAuthenticated from '../../middleware/is-auth';

const router = Router();

// Importing Jwt key
const JWT_KEY = config.get('JWT_KEY');

// @ Description     > Register users
// @ Route           > /users/register
// @ Access Control  > Public
router.post('/register', async (req, res, next) => {
  const { name, age, email, password } = req.body;

  if (!name || !age || !email || !password) {
    return res.status(400).json({
      msg: `empy fields found...`,
    });
  }
  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      return res.status(409).json({
        msg: `user already exist...`,
      });
    }

    const hashedPwd = await hash(password, 12);
    if (!hashedPwd) {
      return res.status(500).json({
        error: `somthing went wrong in hashing the password...`,
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
        error: `something went wrong in adding the user...`,
      });
    }
    const token = await sign({ id: createdUser._id }, JWT_KEY, {
      expiresIn: '3600',
    });

    return res.status(201).json({
      token,
      user: { ...user._doc, password: null },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @ Description     > Authenticate users
// @ Route           > /users/auth
// @ Access Control  > Public
router.post('/auth', async (req, res, next) => {
  const { email, password } = req.body;
  let validUser = null;

  if (!email || !password) {
    return res.status(400).json({
      msg: 'invalid credintials...',
    });
  }
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(409).json({
        msg: `user not found...`,
      });
    }

    validUser = user;
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(409).json({
        msg: `invalid password...`,
      });
    }

    const token = await sign({ id: validUser._id }, JWT_KEY, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      token,
      user: { ...validUser._doc, password: null },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @ Description     > Get authenticated user
// @ Route           > /users/auth-user
// @ Access Control  > Public
router.get('/auth-user', isAuthenticated, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId })
      .select(' -password -__v ')
      .exec();
    if (!user) {
      return res.status(401).json({
        msg: `you not authorized, login first...`,
      });
    }

    return res.status(200).json({
      auth_user: user,
    });
  } catch (error) {
    return res.status().json({
      error: error.message,
    });
  }
});

export default router;
