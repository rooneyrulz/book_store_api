import { Router } from 'express';

// Importing file upload
import upload from '../../utils/file';

// Importing auth middleware
import isAuth from '../../middleware/is-auth';

// Importing controllers
import {
  getBooks,
  getBook,
  addBook,
  deleteBook,
  getBooksByUser,
} from '../../controllers/book';

const router = Router();

// @Description     > Getting all books
// @Route           > /api/books
// @Access Control  > Public
router.get('/books', getBooks);

// @Description     > Getting book by its id
// @Route           > /api/book/:id
// @Access Control  > Public
router.get('/book/:id', getBook);

// @Description     > Posting books
// @Route           > /api/book/add
// @Access Control  > Private
router.post('/book/add', upload, isAuth, addBook);

// @Description     > Getting all of the books created by a user
// @Route           > /api/user/books
// @Access Control  > Private
router.get('/user/books', isAuth, getBooksByUser);

// @Description     > Deleting books
// @Route           > /api/book/:id
// @Access Control  > Private
router.delete('/book/:id', isAuth, deleteBook);

export default router;
