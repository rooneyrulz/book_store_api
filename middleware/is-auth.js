import { verify } from 'jsonwebtoken';
import config from 'config';

export default async (req, res, next) => {
  try {
    // Check for token
    const token = await req.header('x-auth-token');

    if (!token)
      return res.status(401).json({
        msg: `you are not authorized...`,
      });

    // verify token
    const decoded = await verify(token, config.get('JWT_KEY'));

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({
      msg: error.message,
    });
  }
};
