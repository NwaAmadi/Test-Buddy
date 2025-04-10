import { supabase } from "../db/supabase";
import { User } from "../types/interface";

export async function generateOTP(user: User): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();


  await supabase.from("otp_table").delete().eq("userEmail", user.email);
  
  const { error } = await supabase
    .from("otp_table")
    .insert([{ otp, user_email: user.email, is_used: 'FALSE', created_at: new Date(Date.now()), expires_at: new Date(Date.now() + 10 * 60 * 1000) }]);

  if (error) {
    console.error("FAILED TO INSERT OTP:", error);
    throw new Error("DATABSE ERROR");
  }

  return otp;
}
