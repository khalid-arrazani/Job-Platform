export const generatePasswordResetEmail = (resetLink) => {
  return `
  <div style="
    font-family: Arial, sans-serif;
    background: #f4f6f8;
    padding: 30px;
  ">
    <div style="
      max-width: 520px;
      margin: auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    ">
      
      <h2 style="color:#222; margin-bottom: 10px;">
        Reset Your Password
      </h2>

      <p style="color:#555; font-size:14px;">
        We received a request to reset your password.  
        Click the button below to proceed.
      </p>

      <a href="${resetLink}" style="
        display:inline-block;
        margin-top:20px;
        padding:12px 25px;
        background:#2563eb;
        color:white;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
      ">
        Reset Password
      </a>

      <p style="
        margin-top:25px;
        font-size:12px;
        color:#888;
      ">
        If you didn’t request this, you can ignore this email safely.
      </p>

      <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

      <p style="font-size:11px; color:#aaa;">
        This link will expire in 10 minutes for security reasons.
      </p>

    </div>
  </div>
  `;
};