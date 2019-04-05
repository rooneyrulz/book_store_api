import { verify } from 'jsonwebtoken';
import config from 'config';

export default (req, res, next) => {
  // Check for token
  const token = req.header('x-auth-token');

  if (!token)
    return res.status(401).json({
      msg: `you are not authorized...`,
    });

  try {
    // verify token
    const decoded = verify(token, config.get('JWT_KEY'));
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({
      msg: `invalid token...`,
    });
  }
};
