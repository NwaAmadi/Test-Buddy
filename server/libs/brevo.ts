import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const PORT = parseInt(process.env.BREVO_PORT!, 10);
const HOST = process.env.BREVO_HOST!;
const USER = process.env.BREVO_USER_EMAIL!;
const PASS = process.env.BREVO_USER_PASS!;

export const brevoTransporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: false,
  auth: {
    user: USER,
    pass: PASS,
  },
});
