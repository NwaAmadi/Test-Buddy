import {Request, Response} from "express";
import bcrypt from 'bcryptjs';
import express from "express";
import dotenv from 'dotenv';
import { supabase } from "./db/supabase";
import { SignupRequest, LoginRequest } from "./types/interface";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


app.post('/api/signup', async (req: Request, res: Response):Promise<any> => {
  const {email,first_name,last_name,password_hash,role} = req.body as SignupRequest['body'];

  if(!first_name || !last_name || !email || !password_hash || !role) {
    return res.status(400).json({ error: "ALL FIELDS ARE REQUIRED" });
  }
  if(role !== "admin" && role !== "student") {
    return res.status(400).json({ error: "INVALID ROLE" });
  }
  try{
    const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

    if(checkError){
        return res.status(500).json({ message: 'ERROR CHECKING EMAIL'})
    }

    if(existingUser){
        return res.status(400).json({ message: 'INVALID EMAIL'})
    }

    const passwordHash = await bcrypt.hash(password_hash, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        { first_name, last_name, email, password_hash: passwordHash, role }
      ]);
      if (error) {
        return res.status(500).json({ message: 'COULD NOT REGISTER USER'})
      }
      res.status(201).json({ message: 'USER REGISTERED SUCCESSFULLY'})

  }catch (error) {
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
  

}); 

app.listen(PORT, () => {
  console.log(`ACTIVE ON  ${PORT}`);
});