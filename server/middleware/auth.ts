import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';

export interface AuthRequest extends Request {
  user?: { email: string; role: string; verified: boolean };
}


export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'UNAUTHORIZED' }); 
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload: decoded } = await jose.jwtVerify<{ email: string; role: string; verified: boolean }>(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'INVALID TOKEN' });
    return; 
  }
};

export const verifyRefreshToken = async (
  refreshToken: string
): Promise<{ email: string; role: string; id: string }> => {
  try {
    const secret = new TextEncoder().encode(process.env.REFRESH_SECRET!);
    const { payload } = await jose.jwtVerify<{ email: string; role: string; id: string }>(
      refreshToken,
      secret
    );

    return payload;
  } catch (err) {
    throw new Error('INVALID OR EXPIRED REFRESH TOKEN');
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'UNAUTHORIZED: USER NOT FOUND' });
    return;
  }

  if (req.user.verified === false) {
    res.status(401).json({ message: 'USER NOT VERIFIED!' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'ACCESS DENIED: UNAUTHORIZED' });
    return;
  }

  next();
};

export const isStudent = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'UNAUTHORIZED: USER NOT FOUND' });
    return;
  }
  if (req.user.verified === false) {
    res.status(401).json({ message: 'USER NOT VERIFIED!' });
    return;
  }
  if (req.user.role !== 'student') {
    res.status(403).json({ message: 'ACCESS DENIED: UNAUTHORIZED' });
    return;
  }
  next();
};