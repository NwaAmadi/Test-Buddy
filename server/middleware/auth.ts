import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { verifyAdminCode } from '../admin/verifyAdminAccessCode';

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

  /*const access_code = req.body.accessCode;

  if (!access_code) {
    res.status(401).json({ message: 'ACCESS CODE REQUIRED!' });
    return;
  }

  const trueCode = await verifyAdminCode(req.user.email, access_code);

  if (!trueCode) {
    res.status(401).json({ message: 'INVALID ACCESS CODE!' });
    return;
  }*/

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