import { supabase } from "../db/supabase";

export async function cleanupExpiredOTPs(table: string): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error(`FAILED TO CLEAN EXPIRED OTPS FROM TABLE "${table}"`, error);
  } else {
    console.log(`Expired OTPs cleaned up from table "${table}".`);
  }
}
