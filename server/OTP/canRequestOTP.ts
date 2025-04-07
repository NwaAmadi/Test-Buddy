import { supabase } from "../db/supabase";

export async function canRequestOTP(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("otp_table")
    .select("created_at")
    .eq("userEmail", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return true;

  const last = new Date(data.created_at);
  const now = new Date();
  const secondsPassed = (now.getTime() - last.getTime()) / 1000;

  return secondsPassed >= 60;
}
