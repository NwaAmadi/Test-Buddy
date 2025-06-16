import { generateAdminAccessCode } from './adminAccessCodeGenerator';
import { AdminAccessCodeEmailTemplate } from './AdminAccessCodeEmailTemplate';
import { sendMail } from '../mailService/mailTransporter';

//pnpm exec tsx ./admin/adminCodeTransporter.ts
(async () => {
  try {
    const email = 'uccleverson@outlook.com';
    const code = await generateAdminAccessCode(email);
    const template = AdminAccessCodeEmailTemplate(code);
    await sendMail(email, template, 'Your Admin Access Code');
  } catch (err) {
    console.error('Error sending admin access code email:', err);
  }
})();
