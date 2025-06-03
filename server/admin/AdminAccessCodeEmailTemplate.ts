export function AdminAccessCodeEmailTemplate(code: string): string {
  const codeString = String(code).toUpperCase();
  const currentYear = new Date().getFullYear();
  const imgSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAUVBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3C4bvAAAAGnRSTlMA/Crq07blEJQIITrecfQEfWOnVDAY8MeIRpP6Eg4AAAFuSURBVDjL3ZRHgoQgEEWVnMWIcv+DDkna2LPv2lk+6leCpvlp4wIAwf+jOqCxglDhXnRfsHkciC+mhnF+pqhcUesP1qJV0ifJJf9WTOtBZdZgDbpHSRiSO53zZEie6KySxtmplsuru0VsC266lqOKbfRW254Co41Nxxa8C5wN9DmF1jYxOWXla4f5ZFFEmhCw7b9PQUcmRUR26t4jripFzDnC4TlH0WNYcqTM1CZcqqYbU2VWOPzi9XNxhzmEItweAnl2FohzyKtw9ugdDOfHpa4C6/sq6ZUMGgewATBsgLpsD249inlfQDh9BLOkNAnkQyrmA4JcAjELyetVwM34Vl/A2BQgZbkzBbSxP3fwYAVcA+gqSN7BPoC1GkG8GR+2wQVwZo7VIByHQu3xgnDJlj0SPfg3knqiRwmEAHK0qVNoui/KiHKbF0IINLn1Tj6ulD3fa+P0/PpSrBgRGIy4wW706+MzgymYoN0vP8R/Zzsn7KKC6sMAAAAASUVORK5CYII="
  const imgSource2 = "https://www.dropbox.com/scl/fi/qp9b8pbev3s19sn4h4rm1/tinified-compressed-graduation-hat.png?rlkey=8dyeew2nzdupkday8rnz7p8co&st=iz2uisfi&dl=0"
  const Alt = "Test Buddy Logo";

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

      <img src="${imgSource}" alt="${Alt}"/>

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