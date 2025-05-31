// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /login - Store user login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(200).json({ message: 'Login saved' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }  
});
router.get('/logins', async (req, res) => {
	const users = await User.find().sort({ loginTime: -1 });
	res.json(users);
  });

module.exports = router;
