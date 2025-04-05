import {Request, Response} from "express";
import bcrypt from 'bcryptjs';
import express from "express";
import dotenv from 'dotenv';
import { supabase } from "./db/supabase";
import { SignupRequest, LoginRequest, OtpVerify, SendOtp } from "./types/interface";
import { OtpEmailTemplate } from "./OTP/OtpEmailTemplate";
import { generateOTP }  from "./OTP/otpGenerator";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


app.post('/api/signup', async (req: Request, res: Response):Promise<any> => {
  const {email,first_name,last_name,password_hash,role, verified } = req.body as SignupRequest['body'];

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

app.post('/api/otp-verify', async (req: Request, res: Response): Promise<any> => {
  const { otp } = req.body as OtpVerify['body'];

  if (!otp) {
    return res.status(400).json({ error: "OTP REQUIRED" });
  }

  try {
    const { data: otpData, error: otpError } = await supabase
      .from('otp-table')
      .select('*')
      .eq('otp', otp)
      .single();

    if (otpError) {
      return res.status(500).json({ error: otpError.message });
    }

    if (!otpData) {
      return res.status(404).json({ error: "INVALID OTP" });
    }

    const { data: userUpdate, error: updateError } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('email', otpData.email)
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'COULD NOT VERIFY OTP' });
    }

    return res.status(200).json({ message: 'OTP VERIFIED SUCCESSFULLY' });
    res.redirect('/student/dashboard');

  } catch (err) {
    return res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

app.post('/api/sendOtp', async (req: Request, res: Response): Promise<any> => {
  const{ email, generateOTP } = req.body as SendOtp['body'];
  const otp = generateOTP();
  const mail = OtpEmailTemplate(otp);


});

app.listen(PORT, () => {
  console.log(`ACTIVE ON  ${PORT}`);
});
