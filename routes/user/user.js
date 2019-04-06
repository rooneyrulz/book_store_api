import { Router } from 'express';

// Importing models
import User from '../../models/userSchema';
import Book from '../../models/bookSchema';

const router = Router();

// @Description     > Getting all of the users
// @Route           > /users/
// @Access Control  > Public
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ date: -1 })
      .select(' -password -__v ')
      .exec();
    if (users.length < 1) {
      return res.status(409).json({
        msg: `no users found...`,
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
});

// @Description     > Getting users by id
// @Route           > /users/:id
// @Access Control  > Public
router.get('/:id', async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ _id: userId })
      .select(' -password -__v ')
      .exec();
    if (!user) {
      return res.status(409).json({
        msg: `no user exist with this id...`,
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
});

// @Description     > Deleting users
// @Route           > /users/:id
// @Access Control  > Private
router.delete('/:id', async (req, res, next) => {
  const userId = req.params.id;

  try {
    const books = await User.find({ author: userId }).exec();
    if (books.length >= 1) {
      await Book.deleteMany({ author: userId }).exec();
    }
    const user = await User.findOne({ _id: userId }).exec();
    if (!user) {
      return res.status(409).json({
        msg: `no author found...`,
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
});

export default router;
