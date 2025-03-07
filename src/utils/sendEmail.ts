import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";

export const sendEmail = async (mailOptions: Options) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.OUR_EMAIL as string,
        pass: process.env.OUR_PASSWORD as string,
      },
    });

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    return error.message;
  }
}; 
   