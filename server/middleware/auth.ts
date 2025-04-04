import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "ACCESS DENIED" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "INVALID" });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "FORBIDDEN" });
    }
    next();
};

export const isStudent = (req:AuthRequest, res:Response, next: NextFunction) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'UNAUTHORIZED'
      });
    }
    next();
  };
  