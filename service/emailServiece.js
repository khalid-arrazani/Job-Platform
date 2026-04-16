import { resend } from "../config/resend.js";

export const sendVerificationEmail = async (email) => {
  return  resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: "<p>Click to verify your account</p>",
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