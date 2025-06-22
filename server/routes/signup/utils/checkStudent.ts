import { supabase } from "../../../db/supabase";

export default async function checkStudent(first_name: string, last_name: string, email: string): Promise<boolean> {
  const full_name = (first_name + last_name).toLowerCase().replace(/\s/g, '');
  const user_email = email.toLowerCase();

  const { data, error } = await supabase.rpc("check_student", {
    full_name,
    user_email,
  });

  if (error) {
    console.error("Error checking student:", error);
    return false;
  }

  return data.length === 1;
}
