import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { verifyAdminCode } from '../admin_access_code/verifyAdminAccessCode';


export interface AuthRequest extends Request {
  user?: { email: string; role: string ; verified: boolean };
}


export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'UNAUTHORIZED' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET!
    )
    
    const { payload:decoded } = await jose.jwtVerify<{ email: string; role: string; verified: boolean }>(token, secret)
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'INVALID TOKEN' });
  }
};


export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void>=> {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'ACCESS DENIED: UNAUTHORIZED' });
    return;
  }

  const access_code = req.body.accessCode;
  const trueCode = await verifyAdminCode(req.user.email, access_code);

  if (req.user?.role === 'admin' && trueCode){
    next();
  }

  if(req.user.verified === false){
    res.status(401).json({ message: 'USER NOT VERIFIED!'});
    return;
  }

  else if (req.user?.role === 'admin' && access_code === undefined || access_code === null || access_code === ''){
    res.status(401).json({ message: 'ACCESS CODE REQUIRED!'});
    return;
  }

  else if (req.user?.role === 'admin' && !trueCode){
    res.status(401).json({ message: 'INVALID ACCESS CODE!'});
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
