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
router.post('/register', (req, res, next) => {
  const { name, age, email, password } = req.body;

  if (!name || !age || !email || !password) {
    return res.status(400).json({
      message: `empy fields found...`,
    });
  }
  return User.findOne({ email })
    .exec()
    .then(user => {
      if (user) {
        return res.status(409).json({
          message: `user already exist...`,
        });
      }

      return hash(password, 12);
    })
    .then(hashedPwd => {
      const newUser = User({
        _id: new mongoose.Types.ObjectId(),
        name,
        age,
        email,
        password: hashedPwd,
      });

      return newUser.save();
    })
    .then(user => {
      const token = sign({ id: user._id }, JWT_KEY, { expiresIn: '1h' });

      return res.status(201).json({
        token,
        user: { ...user._doc, password: null },
      });
    })
    .catch(err => err.message);
});

// @ Description     > Authenticate users
// @ Route           > /users/auth
// @ Access Control  > Public
router.post('/auth', (req, res, next) => {
  const { email, password } = req.body;
  let validUser;

  if (!email || !password) {
    return res.status(400).json({
      message: 'invalid credintials...',
    });
  }
  return User.findOne({ email })
    .exec()
    .then(user => {
      if (!user) {
        return res.status(409).json({
          message: `user not found...`,
        });
      }

      validUser = user;
      return compare(password, user.password);
    })
    .then(isMatch => {
      if (!isMatch) {
        return res.status(409).json({
          message: `invalid password...`,
        });
      }

      const token = sign({ id: validUser._id }, JWT_KEY, { expiresIn: '1h' });

      return res.status(200).json({
        token,
        user: { ...validUser._doc, password: null },
      });
    })
    .catch(err => {
      throw err.message;
    });
});

// @ Description     > Get authenticated user
// @ Route           > /users/auth-user
// @ Access Control  > Public
router.get('/auth-user', isAuthenticated, (req, res, next) => {
  const userId = req.user.id;

  return User.findOne({ _id: userId })
    .select(' -password -__v ')
    .exec()
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: `you not authorized, login first...`,
        });
      }

      return res.status(200).json({
        auth_user: user,
      });
    })
    .catch(err => {
      throw err.message;
    });
});

export default router;
