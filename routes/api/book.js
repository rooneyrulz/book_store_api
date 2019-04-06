import { Router } from 'express';
import { Types } from 'mongoose';

// Importing models
import Book from '../../models/bookSchema';

import User from '../../models/userSchema';

// Importing file upload
import upload from '../../utils/file';

// Importing auth middleware
import isAuth from '../../middleware/is-auth';

const router = Router();

// @Description     > Getting all books
// @Route           > /api/books
// @Access Control  > Public
router.get('/books', async (req, res, next) => {
  try {
    const books = await Book.find()
      .sort({ date: -1 })
      .exec();

    if (books.length < 1) {
      return res.status(409).json({
        msg: `no books found yet...`,
      });
    }

    const booksList = books.map(book => ({ ...book._doc }));

    return res.status(200).json({
      books: booksList,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @Description     > Getting book by its id
// @Route           > /api/book/:id
// @Access Control  > Public
router.get('/book/:id', async (req, res, next) => {
  const bookId = req.params.id;

  try {
    const book = await Book.findOne({ _id: bookId }).exec();

    if (!book) {
      return res.status(409).json({
        msg: `book not found...`,
      });
    }

    return res.status(200).json({
      book: { ...book._doc },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @Description     > Posting books
// @Route           > /api/book
// @Access Control  > Private
router.post('/book', isAuth, upload, async (req, res, next) => {
  const { name, description } = req.body;
  let validAuthor = null;

  if (!name || !description || !req.file) {
    return res.status(400).json({
      msg: `invalid fields...`,
    });
  }

  try {
    const bookName = await Book.findOne({ name }).exec();

    if (bookName) {
      return res.status(409).json({
        msg: `book name belongs to another book...`,
      });
    }

    const user = await User.findOne({ _id: req.user.id }).exec();

    if (!user) {
      return res.status(409).json({
        msg: `there is no user found...`,
      });
    }

    validAuthor = user;

    const newBook = Book({
      _id: new Types.ObjectId(),
      name,
      description,
      bookImage: req.file.path,
      author: validAuthor._id,
    });

    const createdBook = await newBook.save();

    if (!createdBook) {
      return res.status(500).json({
        error: `something went wrong in creating a book...`,
      });
    }

    const isCreated = res.status(201).json({
      created: { ...createdBook._doc },
    });

    validAuthor.books.push(createdBook);

    const updatedUser = await validAuthor.save();

    if (!updatedUser) {
      return res.status(500).json({
        error: `something went wrong in updating user...`,
      });
    }

    return isCreated;
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @Description     > Getting all of the books created by a user
// @Route           > /api/user/books
// @Access Control  > Private
router.get('/user/books', isAuth, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const books = await Book.find({ author: userId }).exec();

    if (books.length < 1) {
      return res.status(409).json({
        msg: `books not found...`,
      });
    }

    const booksList = books.map(book => ({ ...book._doc }));

    return res.status(200).json({
      books: booksList,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @Description     > Deleting books
// @Route           > /api/book/:id
// @Access Control  > Private
router.delete('/book/:id', isAuth, async (req, res, next) => {
  const bookId = req.params.id;

  try {
    const user = await User.findOne({ books: bookId })
      .select(' books ')
      .exec();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < user.books.length; i++) {
      // eslint-disable-next-line eqeqeq
      if (user.books[i] == bookId) {
        user.books.splice(i, 1);
      } else {
        next();
      }
    }
    await user.save();
    await Book.deleteOne({ _id: bookId }).exec();
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
