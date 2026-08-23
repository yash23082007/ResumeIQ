/**
 * JWT Authentication Middleware
 */

import jwt from 'jsonwebtoken';
import config from '../config.js';
import prisma from '../database.js';

/**
 * Express middleware — extracts and validates JWT from Authorization header.
 * Attaches `req.user` on success.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: [config.jwtAlgorithm],
    });

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Creates a signed JWT for the given user ID.
 */
export function createToken(userId) {
  return jwt.sign(
    { sub: userId },
    config.jwtSecret,
    {
      algorithm: config.jwtAlgorithm,
      expiresIn: `${config.jwtExpirationMinutes}m`,
    }
  );
}

export const requireAuth = authenticate;

