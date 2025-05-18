import dotenv from 'dotenv';
dotenv.config();

export const Globals = {
  SUPABASE_URL: process.env.SUPABASE_URL! as string,
  SUPABASE_KEY: process.env.SUPABASE_KEY! as string,
}