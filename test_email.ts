import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import * as ics from 'ics';

dotenv.config();

console.log('Testing Nodemailer Email System...');
console.log('User 1:', process.env.GMAIL_USER_1);
console.log('Pass 1 set:', !!process.env.GMAIL_PASS_1);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER_1,
    pass: process.env.GMAIL_PASS_1
  }
});

async function test() {
  try {
    const { error: icsError, value: icsValue } = ics.createEvent({
      title: 'StudyOS Test Block',
      description: 'Test block from StudyOS',
      start: [2026, 8, 29, 10, 0],
      end: [2026, 8, 29, 11, 0],
    });

    const info = await transporter.sendMail({
      from: `"StudyOS" <${process.env.GMAIL_USER_1}>`,
      to: 'debg4171@gmail.com',
      subject: 'StudyOS Delivery Test',
      text: 'Hello from StudyOS! If you see this, the basic email works.'
    });
    
    console.log('Success! Email sent. Message ID:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

test();
