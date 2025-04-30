import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';


export const sendOtpEmail = async (toEmail: string, htmlContent: string): Promise<void> => {
  const apiKey = process.env.BREVO_API_KEY!;
  const senderEmail = process.env.BREVO_USER_EMAIL!;

  if (!apiKey || !senderEmail) {
    throw new Error('Missing Brevo API key or sender email in environment.');
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: 'Test Buddy', email: senderEmail },
      to: [{ email: toEmail }],
      subject: 'Hi, Your OTP Code - Complete Your Registration',
      htmlContent,
    },
    {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    }
  );
};
