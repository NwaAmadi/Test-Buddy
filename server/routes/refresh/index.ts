import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import * as jose from 'jose';
import { generateAccessToken } from '../../libs/accessTokenGenerator';
import { verifyRefreshToken } from '../../middleware/auth';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION!;

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({ message: 'REFRESH TOKEN IS MISSING!' });
    return;
  }

  try {
    const { email, role, id } = await verifyRefreshToken(refreshToken);

    const accessToken = await generateAccessToken(
      { email, role, id },
      JWT_SECRET,
      JWT_EXPIRATION
    );

    res.json({
      success: true,
      message: 'TOKEN REFRESHED SUCCESSFULLY!',
      accessToken,
    });
  } catch (error) {
    console.error('REFRESH TOKEN ERROR:', error);
    res.status(403).json({ message: 'INVALID OR EXPIRED REFRESH TOKEN!' });
  }
});


export default router;
