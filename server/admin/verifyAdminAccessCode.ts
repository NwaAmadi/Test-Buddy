import { Globals } from '../variables';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Globals.SUPABASE_URL
const supabaseKey = Globals.SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function verifyAdminCode(email: string, inputCode: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admin_access_code")
    .select("access_code, expires_at, is_used")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return false;
  }

  if (!data) {
    console.warn("No data found.");
    return false;
  }

  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  const isExpired = expiresAt < now;
  const isMatch = data.access_code.toUpperCase() === inputCode.toUpperCase();
  const isUsed = data.is_used === true;

  return isMatch && !isExpired && !isUsed;
}
