const Contact = require('../models/Contact');
const AppError = require('../middleware/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { sendContactEmail } = require('../services/emailService');

// Simple, dependency-free email format check.
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/contact
// 1. Validate input   2. Save to MongoDB   3. Send email   4. Respond
const submitContact = asyncHandler(async (req, res) => {
  const rawName = req.body.name;
  const rawEmail = req.body.email;
  const rawMessage = req.body.message;

  // --- Validation ---
  if (typeof rawName !== 'string' || rawName.trim() === '') {
    throw new AppError('Name is required', 400);
  }
  if (typeof rawEmail !== 'string' || rawEmail.trim() === '') {
    throw new AppError('Email is required', 400);
  }
  if (typeof rawMessage !== 'string' || rawMessage.trim() === '') {
    throw new AppError('Message is required', 400);
  }

  const name = rawName.trim();
  const email = rawEmail.trim();
  const message = rawMessage.trim();

  if (!isValidEmail(email)) {
    throw new AppError('Invalid email address', 400);
  }

  // --- Save to MongoDB ---
  let savedContact;
  try {
    savedContact = await Contact.create({ name, email, message });
  } catch (error) {
    if (error.name === 'ValidationError') throw error; // handled by errorHandler
    console.error('MongoDB save error:', error.message);
    throw new AppError('Failed to save your message. Please try again later.', 500);
  }

  // --- Send email notification ---
  await sendContactEmail({ name, email, message });

  // --- Respond ---
  res.status(201).json({
    success: true,
    message: 'Contact form submitted successfully',
    data: {
      id: savedContact._id
    }
  });
});

module.exports = { submitContact };
