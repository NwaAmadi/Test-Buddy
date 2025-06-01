export function OtpEmailTemplate(otp: string): string {

  const otpString = String(otp).padStart(6, '0');
  const currentYear = new Date().getFullYear();

  return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 20px auto; border-radius: 8px; border: 2px solid black; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <img src="data:image/png;base64,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" alt="Company Logo" style="height: 50px; width: auto; border: 0;" />
  </div>
  <div style="text-align: center; color: #333333;">
    <h2 style="font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 15px; color: #222222;">Verify Your Action</h2>
    <p style="font-size: 15px; color: #555555; margin-bottom: 30px; padding: 0 15px;">
      Please use the following One-Time Password (OTP) to complete your signup. This code is valid for 5 minutes.
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