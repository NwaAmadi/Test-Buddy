import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const PORT = parseInt(process.env.BREVO_PORT as string, 10);
const HOST = process.env.BREVO_HOST as string;
const USER = process.env.BREVO_USER_EMAIL as string;
const PASS = process.env.BREVO_USER_PASS as string;

export const brevoTransporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: false,
  auth: {
    user: USER,
    pass: PASS,
  },
});
