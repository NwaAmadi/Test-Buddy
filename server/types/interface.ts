import { Request } from "express";

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "student";
  verified: boolean;
  access_code?: string;
}

export interface SignupRequest extends Request {
  body: User;
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
    role: "admin" | "student";  
  };
}

export interface OtpVerify extends Request{
  body: {
    email: string;
    otp: string;
  };
}

export interface GetOtp extends Request{
  body:{
    email: string;
  }
}

export interface SendOtp extends Request{
  body:{
    email: string;
  }
}

export interface LoginRequest extends Request{
  body:{
    email: string;
    password: string;
    role: "admin" | "student";
  }
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id?: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
