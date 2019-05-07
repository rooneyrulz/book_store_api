import { Router } from 'express';

// Importing controllers
import {
  getUsers,
  registerUser,
  getUser,
  deleteUser,
} from '../../controllers/user';

const router = Router();

// @Description     > Getting all of the users
// @Route           > /users/
// @Access Control  > Public
router.get('/', getUsers);

// @ Description     > Register users
// @ Route           > /users/add
// @ Access Control  > Public
router.post('/add', registerUser);

// @Description     > Getting users by id
// @Route           > /users/:id
// @Access Control  > Public
router.get('/:id', getUser);

// @Description     > Deleting users
// @Route           > /users/:id
// @Access Control  > Private
router.delete('/:id', deleteUser);

export default router;
