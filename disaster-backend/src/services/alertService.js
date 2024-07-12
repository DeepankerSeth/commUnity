// Purpose: Send multi-channel alerts.
// Early Warning System: Developing a multi-channel alert system

// Improvements:
// Integrated with Twilio for SMS and Nodemailer for email.

// src/services/alertService.js
const twilio = require('twilio'); // Example for SMS
const nodemailer = require('nodemailer'); // Example for email

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
const sendAlert = (message, channels) => {
  channels.forEach(channel => {
    if (channel.type === 'sms') {
      // Send SMS using Twilio
      twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: channel.to,
      }).then(message => console.log(`SMS sent: ${message.sid}`))
        .catch(error => console.error('Error sending SMS:', error));
    } else if (channel.type === 'email') {
      // Send email using Nodemailer
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: channel.to,
        subject: 'Disaster Alert',
        text: message,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
    }
  });
};

// Export the sendAlert function
module.exports = { sendAlert };
