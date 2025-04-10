import { supabase } from "../db/supabase";
import { User } from "../types/interface";

export async function generateAdminAccessCode(prefixLength: number = 6, user: User): Promise<string> {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
  
    const characters = letters + digits;
    let prefix = '';
    for (let i = 0; i < prefixLength; i++) {
      prefix += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    let letterPart = '';
    for (let i = 0; i < 5; i++) {
      letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
    }
  
    
    let digitPart = '';
    for (let i = 0; i < 5; i++) {
      digitPart += digits.charAt(Math.floor(Math.random() * digits.length));
    }
  
 
    const mixedLastPartArray = (letterPart + digitPart).split('').sort(() => Math.random() - 0.5);
    const mixedLastPart = mixedLastPartArray.join('');
  
    const accessCode = prefix + mixedLastPart;
   

    await supabase.from("admin_access_code").delete().eq("user_email", user.email);
    const { error } = await supabase
        .from("admin_access_code")
        .insert([{ access_code: accessCode, is_used: 'FALSE', user_email: user.email, created_at: new Date(Date.now()), expires_at: new Date(Date.now() + 10 * 60 * 1000) }]);

    return accessCode
  }
  
  