import { supabase } from "../db/supabase";
import { User } from "../types/interface";

export async function generateOTP(user: User): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const { error: deleteError } = await supabase
    .from("otp_table")
    .delete()
    .eq("email", user.email);

  if (deleteError) {
    console.error("FAILED TO DELETE OLD OTP:", deleteError);
    throw new Error("DATABASE ERROR");
  }

  const { error } = await supabase
    .from("otp_table")
    .insert([
      {
        otp,
        email: user.email,
        is_used: 'FALSE',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000)
      }
    ]);

  if (error) {
    console.error("FAILED TO INSERT OTP:", error);
    throw new Error("DATABASE ERROR");
  }

  return otp;
}
