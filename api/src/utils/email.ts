import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use App Password, not your regular Gmail password
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    // Verify transporter configuration
    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: `"SchedSync" <${process.env.EMAIL_USER}>`, // Add a friendly name
      to,
      subject,
      text,
    });

    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
