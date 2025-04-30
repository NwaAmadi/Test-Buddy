export function OtpEmailTemplate(otp: string): string {
  return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); text-align: center;">
      
      <img src="https://res.cloudinary.com/dndrfvyn2/image/upload/v1745830519/graduation-hat-svgrepo-com_1_csujro.svg" alt="Company Logo" style="height: 60px; margin-bottom: 20px;" />

      <h2 style="color: #333333; font-weight: 600; margin-bottom: 10px;">Verify Your Action</h2>
      <p style="color: #666666; font-size: 15px; margin-bottom: 30px;">
        Enter the 6-digit code below to complete your request. This OTP will expire in 10 minutes.
      </p>

      <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 30px;">
        ${otp.split('').map(digit => `
          <div style="width: 50px; height: 60px; border: 1px solid #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; background-color: #f5f5f5;">
            ${digit}
          </div>
        `).join('')}
      </div>

      <p style="color: #999999; font-size: 13px; margin-bottom: 0;">
        If you didn’t request this, you can safely ignore this email.
      </p>

      <p style="color: #999999; font-size: 13px; margin-top: 30px;">
        Thanks,<br/><strong>Test Buddy</strong>
      </p>

    </div>
  </div>
`;
}