import { Router } from 'express';

// Importing auth middleware
import isAuth from '../../middleware/is-auth';

// Import controller
import csvDownloadController from '../../controllers/download-csv';

const router = Router();

// @Description     > Downloading books into csv file
// @Route           > /api/download-csv
// @Access Control  > Private
router.get('/', isAuth, csvDownloadController);

export default router;
