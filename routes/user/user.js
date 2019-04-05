import { Router } from 'express';

// Importing models
import User from '../../models/userSchema';
import Book from '../../models/bookSchema';

const router = Router();

// @Description     > Getting all of the users
// @Route           > /users/
// @Access Control  > Public
router.get('/', (req, res, next) =>
  User.find()
    .sort({ date: -1 })
    .select(' -password -__v ')
    .exec()
    .then(users => {
      if (users.length < 1) {
        return res.status(409).json({
          msg: `no users found...`,
        });
      }

      const usersList = users.map(user => ({ ...user._doc }));

      return res.status(200).json({
        users: usersList,
      });
    })
    .catch(err => {
      throw err.message;
    })
);

// @Description     > Getting users by id
// @Route           > /users/:id
// @Access Control  > Public
router.get('/:id', (req, res, next) => {
  const userId = req.params.id;

  return User.findOne({ _id: userId })
    .select(' -password -__v ')
    .exec()
    .then(user => {
      if (!user) {
        return res.status(409).json({
          msg: `no user exist with this id...`,
        });
      }

      return res.status(200).json({
        user: { ...user._doc },
      });
    })
    .catch(err => {
      throw err.message;
    });
});

// @Description     > Deleting users
// @Route           > /users/:id
// @Access Control  > Private
router.delete('/:id', (req, res, next) => {
  const userId = req.params.id;

  return User.find({ author: userId })
    .exec()
    .then(books => {
      if (books.length >= 1) {
        return Book.deleteMany({ author: userId }).exec();
      }

      next();
    })
    .then(books => User.findOne({ _id: userId }).exec())
    .then(user => {
      if (!user) {
        return res.status(409).json({
          msg: `no author found...`,
        });
      }

      return User.deleteOne({ _id: userId }).exec();
    })
    .then(user =>
      res.status(200).json({
        success: true,
      })
    )
    .catch(err => {
      throw err.message;
    });
});

export default router;
