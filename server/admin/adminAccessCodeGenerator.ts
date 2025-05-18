import { createClient } from '@supabase/supabase-js';
import { Globals } from '../variables';

const supabaseUrl = Globals.SUPABASE_URL
const supabaseKey = Globals.SUPABASE_KEY

//TO RUN THIS SCRIPT: tsx .\admin\adminAccessCodeGenerator.ts TO GENERATE A UNIQUE ACCESS CODE
export const supabase = createClient(supabaseUrl, supabaseKey);

function generateRandomString(charSet: string, length: number): string {
  return Array.from({ length }, () => charSet.charAt(Math.floor(Math.random() * charSet.length))).join('');
}

export async function generateAdminAccessCode(email: string): Promise<string> {

  const TABLE_NAME = "admin_access_code";
  const IS_USED_FALSE = "FALSE";
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const characters = letters + digits;
  const prefixLength = 6;


  const prefix = generateRandomString(characters, prefixLength);
  const letterPart = generateRandomString(letters, 5);
  const digitPart = generateRandomString(digits, 5);

  const mixedLastPartArray = (letterPart + digitPart).split('').sort(() => Math.random() - 0.5);
  const mixedLastPart = mixedLastPartArray.join('');

  const accessCode = prefix + mixedLastPart;

  await supabase.from(TABLE_NAME).delete().eq("user_email", email);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert([
      {
        access_code: accessCode,
        is_used: IS_USED_FALSE,
        user_email: email,
        created_at: now,
        expires_at: expiresAt
      }
    ]);

  if (error) {
    console.error('FAILED TO INSERT ACCESS CODE:', error);
    throw new Error('COULD NOT GENERATE ACCESS CODE.');
  }
  console.log('ACCESS CODE GENERATED:', accessCode);
  return accessCode;
}

(async () => {
  const email = 'chibuisiukegbu@gmail.com'
  await generateAdminAccessCode(email);
})();