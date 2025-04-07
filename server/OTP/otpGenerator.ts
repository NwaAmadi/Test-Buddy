import { supabase } from "../db/supabase";
import { User } from "../types/interface";

export async function generateOTP(user: User): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();


  await supabase.from("otp_table").delete().eq("userEmail", user.email);
  
  const { error } = await supabase
    .from("otp_table")
    .insert([{ otp, userEmail: user.email }]);

  if (error) {
    console.error("FAILED TO INSERT OTP:", error);
    throw new Error("DATABSE ERROR");
  }

  return otp;
}
