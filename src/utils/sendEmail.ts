import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";

export const sendEmail = async (mailOptions: Options) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    return error.message;
  }
}; 
   