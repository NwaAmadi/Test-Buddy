import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from "express";
import express from "express";
import { supabase } from "./db/supabase";
import { SignupRequest, LoginRequest, User, OtpVerify, SendOtp } from "./types/interface";
import { OtpEmailTemplate } from "./OTP/OtpEmailTemplate";
import { generateOTP } from "./OTP/otpGenerator";
import { canRequestOTP } from "./OTP/canRequestOTP";
import { cleanupExpiredOTPs } from "./OTP/deleteExpiredOTPs";
import { otpValid } from "./OTP/otpValid";
import { verifyToken, isStudent, AuthRequest } from './middleware/auth';
import { verifyAdminCode } from './admin/verifyAdminAccessCode';
import { generateTokens } from './libs/tokenGenerator';
import { sendOtpEmail } from './libs/brevo';
import { LoginOtpEmailTemplate } from './OTP/loginOtpTemplate';
import { sendMail } from './mailService/mailTransporter';
import cors from 'cors';


import signupRoute from "./routes/signup/signup";
import otpVerifyRoute from "./routes/signup/otpVerify";
import loginSendOtpRoute from "./routes/signup/loginSendOtp";
import loginOtpVerifyRoute from "./routes/signup/loginOtpVerify";
import sendOtpRoute from "./routes/signup/sendOtp";


import studentDashboardRoute from "./routes/student/dashboard";
import examRoute from "./routes/student/exam";
import resultRoute from "./routes/student/result";
import submitExamRoute from "./routes/student/submitExam";
import allResultsRouter from "./routes/student/allResults";

import examsRoutes from "./routes/admin/exams"
import questionsRoutes from "./routes/admin/questions"
import resultsRoutes from "./routes/admin/results"

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const TEST_BUDDY_EMAIL = process.env.TEST_BUDDY_EMAIL as string;
const TEST_BUDDY_EMAIL_PASSWORD = process.env.TEST_BUDDY_EMAIL_PASSWORD as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION as string;


app.use("/api/signup", signupRoute);
app.use("/api/otp-verify", otpVerifyRoute);
app.use("/api/login/send-otp", loginSendOtpRoute);
app.use("/api/login/otp-verify", loginOtpVerifyRoute);
app.use("/api/sendOtp", sendOtpRoute);

app.use("/api/student", studentDashboardRoute);
app.use('/api/exam', examRoute);
app.use("/api/result", resultRoute);
app.use("/api/exam-submission", submitExamRoute);
app.use("/student/results", allResultsRouter);

app.use("/api/admin/exam", examsRoutes)
app.use("/api/admin/questions", questionsRoutes)
app.use("/api/admin/results", resultsRoutes)

app.listen(PORT, () => {
  console.log(`ACTIVE ON  ${PORT}`);
});
