import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from 'cors';


import signupRoute from "./routes/signup/signup";
import otpVerifyRoute from "./routes/signup/otpVerify";
import loginSendOtpRoute from "./routes/signup/loginSendOtp";
import loginOtpVerifyRoute from "./routes/signup/loginOtpVerify";
import sendOtpRoute from "./routes/signup/sendOtp";
import Session from "./routes/active/verify";
import logoutRouter from "./routes/active/logout";


import studentDashboardRoute from "./routes/student/dashboard";
import examRoute from "./routes/student/exam";
import resultRoute from "./routes/student/result";
import submitExamRoute from "./routes/student/submitExam";
import allResultsRouter from "./routes/student/allResults";
import adminResultsRoute from './routes/admin/results';

import examsRoutes from "./routes/admin/exams"
import questionsRoutes from "./routes/admin/questions"
import addStudents from "./routes/admin/students";

import logger from "./routes/student/monitoring"

import refreshRoute from "./routes/refresh/index";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT;

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
app.use('/api/admin', adminResultsRoute);
app.use("/api/admin", addStudents);

app.use("/api/active", Session);
app.use("/api/logout", logoutRouter);

app.use("/api/refresh", refreshRoute);

app.use("/api/monitoring", logger);

app.listen(PORT, () => {
  console.log(`ACTIVE ON  ${PORT}`);
});
