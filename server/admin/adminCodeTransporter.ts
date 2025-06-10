import { generateAdminAccessCode } from './adminAccessCodeGenerator';
import { AdminAccessCodeEmailTemplate } from './AdminAccessCodeEmailTemplate';
import { sendMail } from '../mailService/mailTransporter';


(async () => {
  try {
    const email = 'chibuisiukegbu@gmail.com';
    const code = await generateAdminAccessCode(email);
    const template = AdminAccessCodeEmailTemplate(code);
    await sendMail(email, template, 'Your Admin Access Code');
  } catch (err) {
    console.error('Error sending admin access code email:', err);
  }
})();
