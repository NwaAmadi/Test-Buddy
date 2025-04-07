import { supabase } from "../db/supabase";

export async function otpValid(email: string, inputOtp: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("otp_table")
    .select("otp, expires_at")
    .eq("userEmail", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  const isExpired = new Date(data.expires_at) < new Date();
  const isMatch = data.otp === inputOtp;

  return isMatch && !isExpired;
}
