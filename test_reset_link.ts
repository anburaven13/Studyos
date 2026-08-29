import { auth as firebaseAuth } from './api/firebase-admin.js';
import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const accounts = [
  { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  { user: process.env.GMAIL_USER_2, pass: process.env.GMAIL_PASS_2 },
  { user: process.env.GMAIL_USER_3, pass: process.env.GMAIL_PASS_3 }
];

const sendEmailWithFallback = async (mailOptions: nodemailer.SendMailOptions) => {
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    if (!account.user || !account.pass) {
      console.log(`Skipping account ${i + 1} due to missing credentials.`);
      continue;
    }

    try {
      console.log(`Attempting to send email via account ${i + 1} (${account.user})...`);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
      const info = await transporter.sendMail({
        from: `"StudyOS" <${account.user}>`,
        ...mailOptions
      });
      console.log(`Email successfully sent using account ${i + 1} (${account.user}). Message ID: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to send email using account ${i + 1} (${account.user}):`, error.message);
    }
  }

  console.error("All email accounts failed to send the email.");
  return false;
};

async function test() {
  const email = 'debg4171@gmail.com'; // Replace with user email if needed
  try {
    console.log('Generating link for', email);
    const link = await firebaseAuth.generatePasswordResetLink(email);
    console.log('Link generated:', link);
    const success = await sendEmailWithFallback({
      to: email,
      subject: 'StudyOS - Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #4f46e5; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #374151; font-size: 16px;">Hello,</p>
            <p style="color: #374151; font-size: 16px;">We received a request to reset your password for your StudyOS account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
            </div>
            <p style="color: #374151; font-size: 14px;">If you didn't ask to reset your password, you can safely ignore this email.</p>
          </div>
        </div>
      `
    });
    console.log('Success?', success);
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
