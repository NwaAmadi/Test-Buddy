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

      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAQAAAAm93DmAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+kGAg4YASdUWAQAAALlSURBVEjHzdZNbBRlGMDx3/bDLrRpSiwW6aGGquHShDQkFQwHxURbAxhCMak9UU+cgIPFi5zkBBfhJKkGT0RjPRg0oUbTmJQLHgoJIeVATWNAQPply3bp8nro7LK0s+4ATfSZZJLN885/nn3m+b8z/N8jlWjVel34wZ3VuGW9Xhfl5FzUq/7ZYGvsMSQrREfWkD3WPB2s2k6D5gXBVUcccVUQzBu0U/WTwSp0OGtaENxwTAtoccwNQTDtrA4VSXFtTrstCG46afNjuc1OuikIbjutrTys1XETguCeM9pj17T73D1BMOG41tKwZkddFwSzztmhsuTKSjucMysIrjuqeeWSRgeNCoKM8zrVlP0vNTqdlxEEow5qfJSq12tETrBo2H61iR9erf2GLQpyRvJTutsFWUHOJX3WxV6Y1uOAjbG5dfpckhNkXbCbyWhkTxQXvSy2mRVc1m9TbL7RiWj8Jyu95iVVKqx137j52AuqdGjR5C3v2uCWu8tw+3TbKCXjJ+p0F/pQ2tb1PvSrhWhYPrM1moG86Uv971ZX3IdytjZ434/morH+0hveK5ge0/8mhwu2flfS1lpdvvFXNK150w9pim9+MlvT+qM6g3GfRKaXjHK2tjkV5YMHPpAgUtqdibW11aeR6XeMWLTgnSRA4mxt1m+sYPo2uyzI6iyPSuvRo8bjtl5xZZnpnbLJgNvNmLG98FTzti43vQSwagWwQRoN0a85XxuyVx8GDJosV89KYCg6L8WkAd9iKknzq5IsSgpD8hfNswIfrh4wZWm7em61gBP+lPKxL2xdnYak7Ip2nVsGdHmxaN9JqbdFv1M2eTvpHAbfG/ORfZoc0GPcmAlTHqq1QauXPY9xl5+szmpv+sofhc+k4uNvv9iSvMKleOBnw17xug6vekEaWdN+N2rEb2ZKWfxvg51zzTUD1qpTg6z75uQK/Xx0TgjMx3zsu3BKRoxByT6J4yJtLwZlnprwH8U/PHY8Xr8gIfEAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjUtMDYtMDJUMTQ6MjM6MjIrMDA6MDBmPiA0AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI1LTA2LTAyVDE0OjIzOjIyKzAwOjAwF2OYiAAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNS0wNi0wMlQxNDoyNDowMSswMDowMNFnv84AAAAASUVORK5CYII=" />

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