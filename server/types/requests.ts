import { Request } from "express";

export interface SignupRequest extends Request {
  body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: "admin" | "student";
  };
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
    role: "admin" | "student";  
  };
}
