import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

export const sendOtpEmail = async (
  toEmail: string,
  htmlContent: string
): Promise<{ success: boolean; message?: string }> => {
  const apiKey = process.env.BREVO_API_KEY as string;
  const senderEmail = process.env.BREVO_USER_EMAIL as string;

  // Debugging logs
  console.log('Brevo API Key loaded:', !!apiKey);
  console.log('Brevo Sender Email:', senderEmail);
  console.log('Recipient Email:', toEmail);

  if (!apiKey || !senderEmail) {
    return {
      success: false,
      message: 'Missing Brevo API key or sender email in environment variables.',
    };
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

    console.log('Brevo API response:', response.status, response.data);

    if (response.status === 201) {
      return { success: true };
    } else {
      return {
        success: false,
        message: `Unexpected response status: ${response.status}`,
      };
    }
  } catch (error: any) {
    // More detailed error logging
    console.error('Email sending failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        error.message ||
        'Unknown error occurred',
    };
  }
};
