export function OtpEmailTemplate(otp: string): string {
  const otpString = String(otp).padStart(6, '0');

  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; margin: 0; padding: 40px 20px;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 2px solid black; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">

      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://res.cloudinary.com/dndrfvyn2/image/upload/v1746062725/graduation-hat_scwjdg.png" alt="Company Logo" style="height: 50px; width: auto;" />
      </div>

      <div style="text-align: center; color: #333333;">
        <h2 style="font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 15px; color: #222222;">Verify Your Action</h2>
        <p style="font-size: 15px; color: #555555; margin-bottom: 30px;">
          Please use the following One-Time Password (OTP) to complete your signup. This code is valid for 10 minutes.
        </p>
      </div>

      <div style="margin-bottom: 30px; text-align: center;">
        <p style="font-size: 14px; color: #777777; margin-bottom: 15px;">Your OTP Code:</p>
        <div style="display: flex; justify-content: center; gap: 10px;">
          ${otpString.split('').map(digit => `
            <div style="width: 40px; height: 50px; display: flex; align-items: center; justify-content: center; 
                        font-size: 24px; font-weight: bold; color: #111111; background-color: #f0f0f0; 
                        border: 1px solid #e0e0e0; border-radius: 6px;">
              ${digit}
            </div>
          `).join('')}
        </div>
      </div>

      <div style="text-align: left;">
        <p style="color: #888888; font-size: 13px; margin-bottom: 25px; border-top: 1px solid #eeeeee; padding-top: 20px;">
          If you didn’t initiate this request, you can safely ignore this email or contact our support if you have concerns.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; padding-top: 15px;">
        <p style="color: #aaaaaa; font-size: 12px; margin-bottom: 5px;">
          Thanks,<br/>
          <strong>The Test Buddy Team</strong>
        </p>
        <p style="color: #cccccc; font-size: 11px; margin-bottom: 0;">
          &copy; ${new Date().getFullYear()} Test Buddy Team. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;
}
