import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

export const sendOtpEmail = async (
  toEmail: string,
  htmlContent: string
): Promise<{ success: boolean; message?: string }> => {
  const apiKey = process.env.BREVO_API_KEY as string;
  const senderEmail = process.env.BREVO_USER_EMAIL as string;

  console.log('API Key exists:', !!apiKey);
  console.log('Sender email:', senderEmail);
  console.log('Recipient:', toEmail);

  if (!apiKey || !senderEmail) {
    return { success: false, message: 'Missing Brevo API key or sender email in environment.' };
  }

  try {
    const response = await axios.post(
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

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    if (response.status === 201) {
      return { success: true };
    } else {
      return { success: false, message: `UNEXPECTED ERROR: ${response.status}` };
    }
  } catch (error: any) {
    console.error('Full error:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};