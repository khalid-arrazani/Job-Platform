import { resend } from "../config/resend.js";
import {generateVerificationEmail} from "../emails/VerificationEmail.js"
import {generatePasswordResetEmail} from "../emails/PasswordResetEmail.js"

export const sendVerificationCode = async (email , code) => {
  return  resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: generateVerificationEmail(code),
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  return  resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: generatePasswordResetEmail(resetLink),
  });
};