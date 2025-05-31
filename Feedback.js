const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Feedback = require('../models/feedback');
const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST feedback
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const feedback = new Feedback({ name, email, message, imageUrl });
    await feedback.save();

    // Email admin
    await transporter.sendMail({
      from: `"Campus Tour" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'New Feedback Received',
      html: `
        <h3>New Feedback</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        ${imageUrl ? `<p><strong>Image:</strong> ${imageUrl}</p>` : ''}
      `
    });

    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
