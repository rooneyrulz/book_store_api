import { Router } from 'express';

// Importing model
import Book from '../../models/bookSchema';

// Importing auth middleware
import isAuth from '../../middleware/is-auth';

// Importing writing data
import { writeBooks } from '../../lib/write';

const router = Router();

// @Description     > Downloading books into csv file
// @Route           > /api/users/download-csv
// @Access Control  > Private
router.get('/', isAuth, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const books = await Book.find({ author: userId }).exec();

    if (books.length < 1) {
      return res.status(409).json({
        msg: `books not found...`,
      });
    }

    const booksList = books.map(book => ({ ...book._doc }));

    await writeBooks(booksList);

    return res.status(200).json({
      written: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
