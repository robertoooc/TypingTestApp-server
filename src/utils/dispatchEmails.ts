import nodemailer from 'nodemailer';
import { google } from 'googleapis';

interface EmailOptions {
  recipient: string;
  subject: string;
  message: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  acknowledgingReceipt?: (error: any, info: any) => void;
}

const CLIENT_EMAIL = process.env.EMAIL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

// Create transporter outside of the function
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: CLIENT_EMAIL,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET
  }
});

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const emailQueue: EmailOptions[] = []; // Queue to store email options

// Function to process and send emails from the queue
async function processEmailQueue() {
  if (emailQueue.length === 0) return; // If queue is empty, do nothing

  const emailOptions = emailQueue.shift(); // Take the first email from the queue

  if (!emailOptions) return; // If emailOptions is undefined, do nothing

  try {
    const res = await oauth2Client.getAccessToken();
    const accessToken = res.token;

    const mailOptions = {
      from: CLIENT_EMAIL,
      to: emailOptions.recipient,
      cc: emailOptions.cc,
      bcc: emailOptions.bcc,
      subject: emailOptions.subject,
      html: emailOptions.message,
      replyTo: emailOptions.replyTo,
      auth: {
        user: CLIENT_EMAIL,
        refreshToken: REFRESH_TOKEN,
        accessToken
      }
    };

    const result = await transporter.sendMail(mailOptions);

    if (typeof emailOptions.acknowledgingReceipt === 'function') {
      emailOptions.acknowledgingReceipt(null, result);
    }
  } catch (error) {
    if (typeof emailOptions.acknowledgingReceipt === 'function') {
      emailOptions.acknowledgingReceipt(error, null);
    }
  }
}

// Set interval to process email queue every 1000ms
setInterval(processEmailQueue, 1000);

// Function to add email to the queue
export default function dispatchEmails(emailOptions: EmailOptions) {
  emailQueue.push(emailOptions); // Add email to the queue
}
