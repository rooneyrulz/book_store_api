import { Router } from 'express';

// Importing auth middleware
import isAuthenticated from '../../middleware/is-auth';

// Importing controllers
import { authenticateUser, getAuthUser } from '../../controllers/auth';

const router = Router();

// @ Description     > Authenticate users
// @ Route           > /users/auth
// @ Access Control  > Public
router.post('/', authenticateUser);

// @ Description     > Get authenticated user
// @ Route           > /users/auth-user
// @ Access Control  > Public
router.get('/user', isAuthenticated, getAuthUser);

export default router;
