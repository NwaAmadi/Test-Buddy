import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
  user?: { email: string; role: string };
}


export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'UNAUTHORIZED' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { email: string; role: string };

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'INVALID TOKEN' });
  }
};


export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'ACCESS DENIED: UNAUTHORIZED' });
    return;
  }
  next();
};

export const isStudent = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ message: 'ACCESS DENIED: UNAUTHORIZED' });
    return;
  }
  next();
};
