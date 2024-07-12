// Purpose: Send multi-channel alerts based on user preferences.

// src/services/alertService.js
import twilio from 'twilio'; // Example for SMS
import nodemailer from 'nodemailer'; // Example for email
import User from '../models/userModel';

// Twilio configuration for SMS
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer configuration for email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send alerts
const sendAlert = async (message, userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { alertPreferences } = user;

    if (alertPreferences.sms) {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phoneNumber,
      });
      console.log(`SMS sent to user ${userId}`);
    }

    if (alertPreferences.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Disaster Alert',
        text: message,
      });
      console.log(`Email sent to user ${userId}`);
    }

    if (alertPreferences.push) {
      // Implement push notification logic here
      console.log(`Push notification sent to user ${userId}`);
    }
  } catch (error) {
    console.error('Error sending alert:', error);
  }
};

export { sendAlert };