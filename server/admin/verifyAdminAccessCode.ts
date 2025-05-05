import { supabase } from "../db/supabase";

export async function verifyAdminCode(email: string, inputCode: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admin_access_code")
    .select("access_code, expires_at, is_used")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  const isExpired = new Date(data.expires_at) < new Date();
  const isMatch = data.access_code === inputCode;
  const isUsed = data.is_used === true;

  return isMatch && !isExpired && !isUsed;
}