export const generateVerificationEmail = (code) => {
  return `
  <div style="
    font-family: Arial, sans-serif;
    background: #f4f4f4;
    padding: 20px;
  ">
    <div style="
      max-width: 500px;
      margin: auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
    ">
      <h2 style="color:#333;">Verify Your Email</h2>

      <p style="color:#555;">
        Use the code below to verify your account:
      </p>

      <div style="
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 5px;
        margin: 20px 0;
        color: #111;
      ">
        ${code}
      </div>

      <p style="color:#888; font-size: 12px;">
        This code will expire in 10 minutes.
      </p>
    </div>
  </div>
  `;
};