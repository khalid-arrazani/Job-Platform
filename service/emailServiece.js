import { resend } from "../config/resend.js";

export const sendVerificationCode = async (email ,code) => {
  return  resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href="${code}">here</a> to verify your email.</p>`,
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  return  resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
};