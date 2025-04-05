export function OtpEmailTemplate(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
        <p>Use the following OTP to complete your action. This code is valid for the next 10 minutes.</p>
        <h1 style="background: #f4f4f4; padding: 10px; display: inline-block;">${otp}</h1>
        <p>If you didn’t request this, you can ignore this email.</p>
        <p style="margin-top: 30px;">Thanks,<br/>Your Company Name</p>
      </div>
    `;
  }
  