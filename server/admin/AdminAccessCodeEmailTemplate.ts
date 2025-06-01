export function AdminAccessCodeEmailTemplate(code: string): string {
  const codeString = String(code).toUpperCase();
  const currentYear = new Date().getFullYear();

  return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 20px auto; border-radius: 8px; border: 2px solid black; padding: 20px;">
  <style>
    @media only screen and (max-width: 600px) {
      .tb-container {
        padding: 10px !important;
        max-width: 98vw !important;
      }
      .tb-code-box {
        font-size: 20px !important;
        padding: 10px 8px !important;
        letter-spacing: 6px !important;
        word-break: break-all !important;
      }
      .tb-title {
        font-size: 18px !important;
      }
      .tb-desc {
        font-size: 13px !important;
      }
    }
  </style>
  <div class="tb-container" style="max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://res.cloudinary.com/dndrfvyn2/image/upload/v1746062725/graduation-hat_scwjdg.png" alt="Company Logo" style="height: 50px; width: auto; border: 0;" />
    </div>

    <div style="text-align: center; color: #333333;">
      <h2 class="tb-title" style="font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 15px; color: #222222;">Admin Access Verification</h2>
      <p class="tb-desc" style="font-size: 15px; color: #555555; margin-bottom: 30px; padding: 0 15px;">
        Please use the following admin access code to proceed with your admin action. This code is valid for 5 minutes.
      </p>
    </div>

    <div style="margin-bottom: 30px; text-align: center;"> 
      <p style="font-size: 14px; color: #777777; margin-bottom: 15px;">Your Admin Access Code:</p>
      <div class="tb-code-box" style="
        display: inline-block;
        border: 2px solid #111;
        border-radius: 8px;
        background-color: #f0f0f0;
        padding: 12px 28px;
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 12px;
        color: #111111;
        margin-bottom: 10px;
        word-break: break-all;
        ">
        ${codeString}
      </div>
    </div>

    <div style="text-align: left; padding: 0 15px;">
      <p style="color: #888888; font-size: 13px; margin-bottom: 25px; border-top: 1px solid #eeeeee; padding-top: 20px;">
        If you didn’t request this code, you can safely ignore this email. For concerns, contact our support.
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