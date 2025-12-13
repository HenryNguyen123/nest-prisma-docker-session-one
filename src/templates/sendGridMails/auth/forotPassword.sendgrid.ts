interface fpType {
  name: string;
  link: string;
}

export const mailRegister = () => {
  const data = ``;

  return data;
};

export const forgetPasswordHTML = (props: fpType) => {
  const data = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f7;
              margin: 0;
              padding: 0;
              color: #51545e;
          }
          .container {
              width: 100%;
              padding: 20px;
              background-color: #f4f4f7;
          }
          .email-content {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 {
              font-size: 24px;
              font-weight: bold;
              color: #333333;
          }
          p {
              font-size: 16px;
              line-height: 1.5;
              margin: 15px 0;
          }
          a.button {
              display: inline-block;
              padding: 12px 20px;
              margin: 20px 0;
              font-size: 16px;
              color: #ffffff;
              background-color: #3869d4;
              text-decoration: none;
              border-radius: 6px;
          }
          .footer {
              font-size: 12px;
              color: #888888;
              margin-top: 30px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="email-content">
              <h1>Hello ${props.name},</h1>
              <p>We received a request to reset the password for your account associated with this email address. If you did not make this request, you can safely ignore this email. Otherwise, you can reset your password using the link below.</p>
              
              <p>Click the button below to reset your password. This link will expire in 24 hours for your security.</p>

              <a href="${props.link}" class="button">Reset Password</a>

              <p>Why did I receive this email? You are receiving this email because someone requested a password reset for your account. If this was not you, please ignore it.</p>

              <p>If you have any issues, feel free to contact our support team. We're here to help you 24/7.</p>

              <h2>Security Reminder:</h2>
              <ul>
                  <li>Never share your password with anyone.</li>
                  <li>Use a strong, unique password for every account.</li>
                  <li>Update your passwords regularly.</li>
              </ul>

              <p>Thank you for using our service. We appreciate your trust and will continue to ensure your account is safe and secure.</p>

              <div class="footer">
                  <p>&copy; 2025 Minh Nhat Shop. All rights reserved.</p>
                  <p>Minh Nhat Shop, Tp HCM, Viet Nam</p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;

  return data;
};

export const confirmForgetPassword = () => {
  const data = ``;

  return data;
};
