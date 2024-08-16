// Purpose: Send multi-channel alerts based on user preferences.

// src/services/alertService.js
import twilio from 'twilio'; // Example for SMS
import nodemailer from 'nodemailer'; // Example for email
import { getUserFromAuth0 } from './auth0Service.js';

// Twilio configuration for SMS
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer configuration for email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send alerts
const sendAlert = async (message, auth0Id) => {
  try {
    const user = await getUserFromAuth0(auth0Id);
    if (!user) {
      throw new Error('User not found');
    }

    const { alertPreferences } = user;

    if (alertPreferences.sms && user.phoneNumber) {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phoneNumber,
      });
      console.log(`SMS sent to user ${auth0Id}`);
    }

    if (alertPreferences.email && user.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Disaster Alert',
        text: message,
      });
      console.log(`Email sent to user ${auth0Id}`);
    }

    if (alertPreferences.push) {
      // Implement push notification logic here
      console.log(`Push notification sent to user ${auth0Id}`);
    }
  } catch (error) {
    console.error('Error sending alert:', error);
  }
};

export { sendAlert };