import { Router } from 'express';

// Import Controller
import testController from '../../controllers';

const router = Router();

// @Description     > Testing route
// @Route           > /api/test
// @Access Control  > Public
router.get('/', testController);

export default router;
