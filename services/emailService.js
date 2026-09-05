const nodemailer = require("nodemailer");
const AppError = require("../middleware/AppError");

// Nodemailer is a Node.js library that sends emails through an SMTP server.
// Here we use Gmail's SMTP server. Gmail requires an "App Password" instead
// of your normal account password when an app connects via SMTP like this
// (see README.md for how to generate one).
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false for port 587 (STARTTLS upgrades the connection)
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000,
});

// Sends the contact form submission to CONTACT_RECEIVER.
// Throws an AppError (500) if sending fails, which the centralized
// error handler will turn into a clean JSON response.
const sendContactEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_RECEIVER,
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    text: `Name:\n${name}\n\nEmail:\n${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new AppError("Failed to send email notification", 500);
  }
};

module.exports = { sendContactEmail };
