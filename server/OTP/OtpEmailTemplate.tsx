export function OtpEmailTemplate(otp: string): string {

  const otpString = String(otp).padStart(6, '0');
  const currentYear = new Date().getFullYear();

  return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 20px auto; border: 2px solid black; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://res.cloudinary.com/dndrfvyn2/image/upload/v1746062725/graduation-hat_scwjdg.png" alt="Company Logo" style="height: 50px; width: auto; border: 0;" />
  </div>
  <div style="text-align: center; color: #333333;">
    <h2 style="font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 15px; color: #222222;">Verify Your Action</h2>
    <p style="font-size: 15px; color: #555555; margin-bottom: 30px; padding: 0 15px;">
      Please use the following One-Time Password (OTP) to complete your signup. This code is valid for 10 minutes.
    </p>
  </div>

  <div style="margin-bottom: 30px; text-align: center;"> 
    <p style="font-size: 14px; color: #777777; margin-bottom: 15px;">Your OTP Code:</p>
    
    <div>
      ${otpString.split('').map(digit => `
        <div style="
            display: inline-block;  
            width: 40px;
            height: 50px;
            line-height: 50px;     
            text-align: center;    
            vertical-align: top;  
            font-size: 24px;
            font-weight: bold;
            color: #111111;
            background-color: #f0f0f0;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin: 0 5px;         
        ">
          ${digit}
        </div>
      `).join('')}
    </div>
  </div>

  <div style="text-align: left; padding: 0 15px;">
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
      &copy; ${currentYear} Test Buddy Team. All rights reserved.
    </p>
  </div>

</div>
  `;
}