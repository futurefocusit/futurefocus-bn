export const resetTemplates = (user: any, token: any) => {
    return `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style type="text/css">
          body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
          }
          .email-container {
              width: 100%;
              max-width: 600px;
              margin: auto;
              border: 1px solid #ccc;
          }
          .email-header, .email-footer {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
          }
          .email-body {
              padding: 20px;
          }
          a {
              background-color: #0000cc;
              color: #fff;
              padding: 12px;
              margin: 0 auto;
              text-decoration: none;
          }
          a:hover {
              background-color: #3358FF;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="email-header">
              <h1>Password Reset Request</h1>
          </div>
          <div class="email-body">
              <p>Hello, Admin</p>
              <p>It seems like you are trying to reset your password. Click the link below to reset your password.</p>
              <a href="${process.env.FRONT_END_URI}/reset-password/${token}">Reset Password</a>
              <p>If you are not Xcooll user , please ignore this email.</p>
              <p>Best Regards,<br>Xcooll Team</p>
          </div>
          <div class="email-footer">
              <p>&copy; 2025 Xcooll. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
};

export const staffResetTemplates = (user: any, token: any) => {
    return `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style type="text/css">
          body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
          }
          .email-container {
              width: 100%;
              max-width: 600px;
              margin: auto;
              border: 1px solid #ccc;
          }
          .email-header, .email-footer {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
          }
          .email-body {
              padding: 20px;
          }
          a {
              background-color: #0000cc;
              color: #fff;
              padding: 12px;
              margin: 0 auto;
              text-decoration: none;
          }
          a:hover {
              background-color: #3358FF;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="email-header">
              <h1>Password Reset Request</h1>
          </div>
          <div class="email-body">
              <p>Hello, ${user}</p>
              <p>It seems like you are trying to reset your password. Click the link below to reset your password.</p>
              <a href="${process.env.STUDENT_PORTAL}/reset-password/${token}">Reset Password</a>
              <p>If you are not XCooll , please ignore this email.</p>
              <p>Best Regards,<br>Xcooll Team</p>
          </div>
          <div class="email-footer">
              <p>&copy; 2025 Xcooll. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
};
export const SubscriptionEmail = () => {
    return `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style type="text/css">
          body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
          }
          .email-container {
              width: 100%;
              max-width: 600px;
              margin: auto;
              border: 1px solid #ccc;
          }
          .email-header, .email-footer {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
          }
          .email-body {
              padding: 20px;
          }
          a {
              background-color: #0000cc;
              color: #fff;
              padding: 12px;
              margin: 0 auto;
              text-decoration: none;
          }
          a:hover {
              background-color: #3358FF;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="email-header">
              <h1>Xcooll</h1>
          </div>
          <div class="email-body">
              <p>Hello </p>
              <p> thank you for subscribe to our Future Xcooll</p>
              <
              <p>Future Xcooll,<br>Here to serve you</p>
          </div>
          <div class="email-footer">
              <p>&copy; 2024 Xcooll All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
};
export const notifyInstuEmail = (name: string) => {
    return `

    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Success Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #ddd;
        }
        .header h1 {
            color: #28a745;
        }
        .message {
            margin-top: 20px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #28a745;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>Registration Successful</h1>
        </div>

        <div class="message">
            <p>Dear  ${name}</p>

            <p>We are pleased to inform you that your institution has been successfully registered in our system!</p>

            <p>Thank you for choosing our platform. Your registration is now complete. our board will reveiw your application you'ill notified once verified.</p>

            <p>If you need any assistance, feel free to reach out to us via our support page.</p>

            <p>Best regards,<br> The Xcool Team</p>

            <a href="${process.env.FRONT_END_URI}/support" class="btn">Visit Support Page</a>
        </div>

        <div class="footer">
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p><a href="${process.env.FRONT_END_URI}">Visit our website</a> | <a href="rodrirwigara@gmail.com">Contact Dev Team</a></p>
        </div>
    </div>

</body>
</html>

    `
}
export const notifyInstuVerificationEmail = (name: string) => {
    return `

    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Success Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #ddd;
        }
        .header h1 {
            color: #28a745;
        }
        .message {
            margin-top: 20px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #28a745;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>Registration Successful</h1>
        </div>

        <div class="message">
            <p>Dear  ${name}</p>

            <p>Conglaturations! We are pleased to inform you that your institution has been successfully verified in our system!</p>

            <p> Your registration processs in now complete. contact Support Team to unlock features and start</p>
            <p> use your admin email to reset password and start enjoying our service </p>


            <p>If you need any assistance, feel free to reach out to us via our support page.</p>

            <p>Best regards,<br> The Xcool Team</p>

            <a href="${process.env.FRONT_END_URI}/support" class="btn">Visit Support Page</a>
        </div>

        <div class="footer">
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p><a href="${process.env.FRONT_END_URI}">Visit our website</a> | <a href="rodrirwigara@gmail.com">Contact Dev Team</a></p>
        </div>
    </div>

</body>
</html>

    `
}

export const SubscriptionExpiryEmail = (institutionName: string, gracePeriodDays: number) => {
    if (gracePeriodDays > 0) {
        return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Subscription Expiry Notice</h2>
      <p>Dear ${institutionName},</p>
      <p>Your subscription has expired, but you have entered a ${gracePeriodDays}-day grace period.</p>
      <p>During this grace period, you can still access the system, but we recommend renewing your subscription as soon as possible.</p>
      <p>If you have any questions or need assistance, please contact our support team.</p>
      <p>Best regards,<br>Future Focus Team</p>
    </div>
  `;
    } else {
        return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Subscription Expired</h2>
      <p>Dear ${institutionName},</p>
      <p>Your subscription and grace period have ended. To continue using our services, please renew your subscription.</p>
      <p>If you have any questions or need assistance, please contact our support team.</p>
      <p>Best regards,<br>Future Focus Team</p>
    </div>
  `;
    }
};
