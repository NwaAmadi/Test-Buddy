import { supabase } from "../db/supabase";

export async function otpValid(
  table: string,
  email: string,
  inputOtp: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(table)
    .select("otp, expires_at, is_used")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  const isExpired = new Date(data.expires_at) < new Date();
  const isMatch = data.otp === inputOtp;
  const isUsed = data.is_used === true;

  return isMatch && !isExpired && !isUsed;
}
