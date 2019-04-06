import { Router } from 'express';

const router = Router();

// @Description     > Testing route
// @Route           > /api/test
// @Access Control  > Public
router.get('/', async (req, res, next) => {
  console.log(`testing...`);
  return res.status(200).json({
    message: `Yay! It is working....`,
  });
});

export default router;
