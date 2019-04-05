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
router.get('/books', (req, res, next) =>
  Book.find()
    .sort({ date: -1 })
    .exec()
    .then(books => {
      if (books.length < 1) {
        return res.status(409).json({
          message: `no books found yet...`,
        });
      }

      const booksList = books.map(book => ({ ...book._doc }));

      return res.status(200).json({
        books: booksList,
      });
    })
    .catch(err => {
      throw err.message;
    })
);

// @Description     > Getting book by its id
// @Route           > /api/book/:id
// @Access Control  > Public
router.get('/book/:id', (req, res, next) => {
  const bookId = req.params.id;

  return Book.findOne({ _id: bookId })
    .exec()
    .then(book => {
      if (!book) {
        return res.status(409).json({
          message: `book not found...`,
        });
      }

      return res.status(200).json({
        book: { ...book._doc },
      });
    })
    .catch(err => {
      throw err.message;
    });
});

// @Description     > Posting books
// @Route           > /api/book
// @Access Control  > Private
router.post('/book', isAuth, upload, (req, res, next) => {
  const { name, description } = req.body;
  let createdBook;
  let validAuthor;

  if (!name || !description || !req.file) {
    return res.status(400).json({
      message: `invalid fields...`,
    });
  }
  return Book.findOne({ name })
    .exec()
    .then(book => {
      if (book) {
        return res.status(409).json({
          message: `book name already exist...`,
        });
      }
      return User.findOne({ _id: req.user.id }).exec();
    })
    .then(author => {
      if (!author) {
        return res.status(409).json({
          message: `no author found with this id...`,
        });
      }

      validAuthor = author;

      const newBook = Book({
        _id: new Types.ObjectId(),
        name,
        description,
        bookImage: req.file.path,
        author: validAuthor._id,
      });

      return newBook.save();
    })
    .then(book => {
      createdBook = res.status(200).json({
        book: { ...book._doc },
      });

      validAuthor.books.push(book);
      return validAuthor.save();
    })
    .then(() => createdBook)
    .catch(err => {
      throw err.message;
    });
});

// @Description     > Getting all of the books created by a user
// @Route           > /api/user/books
// @Access Control  > Private
router.get('/user/books', isAuth, (req, res, next) => {
  const userId = req.user.id;

  return Book.find({ author: userId })
    .exec()
    .then(books => {
      if (books.length < 1) {
        return res.status(409).json({
          msg: `books not found...`,
        });
      }

      const booksList = books.map(book => ({ ...book._doc }));

      return res.status(200).json({
        books: booksList,
      });
    })
    .catch(err => {
      throw err.message;
    });
});

// @Description     > Deleting books
// @Route           > /api/book/:id
// @Access Control  > Private
router.delete('/book/:id', isAuth, (req, res, next) => {
  const bookId = req.params.id;

  return Book.findOne({ books: bookId })
    .select(' books ')
    .exec()
    .then(user => {
      // eslint-disable-next-line no-plusplus
      for (let book = 0; book < user.books.length; book++) {
        // eslint-disable-next-line eqeqeq
        if (user.books[book] == bookId) {
          user.books.splice(book, 1);
        } else {
          next();
        }
      }

      return user.save();
    })
    .then(user => Book.deleteOne({ _id: bookId }).exec())
    .then(book =>
      res.status(200).json({
        success: true,
      })
    )
    .catch(err => {
      throw err.message;
    });
});

export default router;
