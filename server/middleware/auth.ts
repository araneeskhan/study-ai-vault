import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await AuthService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
};