import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import config from 'config';

// Importing models
import User from '../models/userSchema';

// Importing Jwt key
const JWT_KEY = config.get('JWT_KEY');

// @ Description     > Authenticate users
// @ Route           > /users/auth
// @ Access Control  > Public
export const authenticateUser = async (req, res, next) => {
  const { email, password } = req.body;
  let validUser = null;

  if (!email || !password) {
    return res.status(400).json({
      msg: 'Invalid credintials!',
    });
  }
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(409).json({
        msg: `User not found!`,
      });
    }

    validUser = user;
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(409).json({
        msg: `Invalid password!`,
      });
    }

    const token = await sign({ id: validUser._id }, JWT_KEY, {
      expiresIn: 3600,
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
};

// @ Description     > Get authenticated user
// @ Route           > /users/auth-user
// @ Access Control  > Public
export const getAuthUser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId })
      .select(' -password -__v ')
      .exec();
    if (!user) {
      return res.status(401).json({
        msg: `Unauthorized!`,
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status().json({
      error: error.message,
    });
  }
};
