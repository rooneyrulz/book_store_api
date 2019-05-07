import mongoose from 'mongoose';

// Importing models
import Book from '../models/bookSchema';
import User from '../models/userSchema';

// @Description     > Getting all books
// @Route           > /api/books
// @Access Control  > Public
export const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find()
      .populate(' author ')
      .sort({ date: -1 })
      .exec();

    if (books.length < 1) {
      return res.status(409).json({
        msg: `No books found yet!`,
      });
    }

    const booksList = books.map(book => ({ ...book._doc }));

    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// @Description     > Getting book by its id
// @Route           > /api/book/:id
// @Access Control  > Public
export const getBook = async (req, res, next) => {
  const bookId = req.params.id;

  try {
    const book = await Book.findOne({ _id: bookId })
      .populate(' author ')
      .exec();

    if (!book) {
      return res.status(409).json({
        msg: `Book not found!`,
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// @Description     > Posting books
// @Route           > /api/book/add
// @Access Control  > Private
export const addBook = async (req, res, next) => {
  const { name, description } = req.body;
  let validAuthor = null;

  console.log(req.file);

  if (!name || !description || !req.file) {
    return res.status(400).json({
      msg: `Invalid fields!`,
    });
  }

  try {
    const bookName = await Book.findOne({ name }).exec();

    if (bookName) {
      return res.status(409).json({
        msg: `Book name belongs to another book!`,
      });
    }

    const user = await User.findOne({ _id: req.user.id }).exec();

    if (!user) {
      return res.status(409).json({
        msg: `There is no user found!`,
      });
    }

    validAuthor = user;

    const newBook = Book({
      _id: new mongoose.Types.ObjectId(),
      name,
      description,
      bookImage: req.file.path,
      author: validAuthor._id,
    });

    const createdBook = await newBook.save();

    if (!createdBook) {
      return res.status(500).json({
        error: `Something went wrong in creating a book!`,
      });
    }

    const isCreated = res.status(201).json({
      created: { ...createdBook._doc },
    });

    validAuthor.books.push(createdBook);

    const updatedUser = await validAuthor.save();

    if (!updatedUser) {
      return res.status(500).json({
        error: `Something went wrong in updating user!`,
      });
    }

    return isCreated;
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// @Description     > Getting all of the books created by a user
// @Route           > /api/user/books
// @Access Control  > Private
export const getBooksByUser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const books = await Book.find({ author: userId }).exec();

    if (books.length < 1) {
      return res.status(409).json({
        msg: `Books not found!`,
      });
    }

    const booksList = books.map(book => ({ ...book._doc }));

    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// @Description     > Deleting books
// @Route           > /api/book/:id
// @Access Control  > Private
export const deleteBook = async (req, res, next) => {
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
};
