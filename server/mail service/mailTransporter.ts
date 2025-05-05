import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

export const sendMail = async (
  toEmail: string,
  htmlContent: string,
  subject: string = 'No Subject'
): Promise<{ success: boolean; message?: string }> => {
  const apiKey = process.env.BREVO_API_KEY as string;
  const senderEmail = process.env.BREVO_USER_EMAIL as string;

  if(!apiKey){
    return {
      success: false,
      message: 'AUTHORIZATION REQUIRED',
    };
  }

  if(!senderEmail){
    return{
        success: false,
        message: 'SENDER EMAIL REQUIRED'
    }
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'Test Buddy', email: senderEmail },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      return { success: true };
    } else {
      return { success: false, message: `UNEXPECTED ERROR: ${response.status}` };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
