import { Request, Response, NextFunction } from 'express';
import { verifyToken, COOKIE_NAME, JwtPayload } from '../utils/jwt.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userRole?: 'OWNER' | 'EDITOR' | 'VIEWER';
      projectDoc?: any;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    // Also check Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
  }
}
