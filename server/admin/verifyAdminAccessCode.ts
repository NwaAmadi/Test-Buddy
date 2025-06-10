/*import { Globals } from '../variables';
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
  const isMatch = data.access_code === inputCode;
  const isUsed = data.is_used === true;

  return isMatch && !isExpired && !isUsed;
}*/

import { supabase } from "../db/supabase";
import { Globals } from '../variables';
import { createClient } from '@supabase/supabase-js';

export async function verifyAdminCode(email: string, inputCode: string): Promise<boolean> {
  // 1. Log the inputs the function receives
  console.log(`--- Verifying Admin Code ---`);
  console.log(`Received Email: '${email}'`);
  console.log(`Received Input Code: '${inputCode}'`);

  const { data, error } = await supabase
    .from("admin_access_code")
    .select("access_code, expires_at, is_used")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Supabase error during fetch:", error.message);
    return false;
  }

  if (!data) {
    // This means no code was found for the 'Received Email'
    console.warn("Verification Failed: No admin code entry found for this email address.");
    return false;
  }
  
  // 2. Log the data you fetched from the database
  console.log("Data fetched from DB:", data);
  console.log(`DB Code: '${data.access_code}'`);


  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  const isExpired = expiresAt < now;
  const isMatch = data.access_code === inputCode;
  const isUsed = data.is_used === true;
  
  // 3. Log the result of each individual check
  console.log(`Is Match? ${isMatch}`);
  console.log(`Is Expired? ${isExpired}`);
  console.log(`Is Used? ${isUsed}`);
  
  const finalResult = isMatch && !isExpired && !isUsed;
  console.log(`Final Verification Result: ${finalResult}`);
  console.log(`--------------------------`);

  return finalResult;
}