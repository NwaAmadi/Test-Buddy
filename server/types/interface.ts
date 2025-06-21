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
export interface AccessTokenRequest {
  accessToken: string;
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

export type RawResult = {
  id: string;
  score: number;
  total: number;
  passed: boolean;
  answers: any;
  exams?: {
    title: string;
  }[];
};

export interface StudentExamResult {
  id: string;
  score: number;
  total: number;
  passed: boolean;
  answers: any; 
  exam_title: string;
}
export interface ExamResult {
  student_id: string;
  first_name: string;
  last_name: string;
  score: number;
  total: number;
  passed: boolean;
  submitted_at: string;
}
export interface GetExamResultsParams {
  exam_id: string;
}
export  interface ActiveState{
  user_email: string;
  role: "admin" | "student";
  status: boolean;
}