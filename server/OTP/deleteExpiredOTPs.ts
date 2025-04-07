import { supabase } from "../db/supabase";

export async function cleanupExpiredOTPs(): Promise<void> {
  const { error } = await supabase
    .from("otp_table")
    .delete()
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("FAILED TO CLEAN EXPIRED OTPS", error);
  }
}
