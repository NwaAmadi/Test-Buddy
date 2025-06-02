export function OtpEmailTemplate(otp: string): string {

  const otpString = String(otp).padStart(6, '0');
  const currentYear = new Date().getFullYear();

  return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 20px auto; border-radius: 8px; border: 2px solid black; padding: 20px;">
  <style>
    @media only screen and (max-width: 600px) {
      .tb-container {
        padding: 10px !important;
        max-width: 98vw !important;
      }
      .tb-title {
        font-size: 18px !important;
      }
      .tb-desc {
        font-size: 13px !important;
      }
      .tb-otp-label {
        font-size: 13px !important;
      }
      .tb-otp-boxes {
        padding: 10px 0 !important;
      }
      .tb-otp-digit {
        width: 32px !important;
        height: 40px !important;
        font-size: 18px !important;
        margin: 0 2px !important;
      }
    }
  </style>
  <div class="tb-container" style="max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://res.cloudinary.com/dndrfvyn2/image/upload/v1746062725/graduation-hat_scwjdg.png" alt="Company Logo" style="height: 50px; width: auto; border: 0;" />
    </div>
    <div style="text-align: center; color: #333333;">
      <h2 class="tb-title" style="font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 15px; color: #222222;">Verify Your Action</h2>
      <p class="tb-desc" style="font-size: 15px; color: #555555; margin-bottom: 30px; padding: 0 15px;">
        Please use the following One-Time Password (OTP) to complete your signup. This code is valid for 5 minutes.
      </p>
    </div>
    <div style="margin-bottom: 30px; text-align: center;">
      <p class="tb-otp-label" style="font-size: 14px; color: #777777; margin-bottom: 15px;">Your OTP Code:</p>
      <div class="tb-otp-boxes" style="display: flex; justify-content: center; gap: 8px; padding: 12px 0;">
        ${otpString.split('').map(digit => `
          <span class="tb-otp-digit" style="
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
            margin: 0 4px;
          ">${digit}</span>
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
</div>
  `;
}