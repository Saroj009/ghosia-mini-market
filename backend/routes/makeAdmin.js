const express = require('express');
const router = express.Router();
const User = require('../models/User');

// TEMPORARY ROUTE - Make any user admin by email
// Remove this route after creating your admin account!
router.post('/make-admin', async (req, res) => {
  try {
    const { email, secretKey } = req.body;
    
    // Simple security - require a secret key
    if (secretKey !== 'make-me-admin-2026') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ 
      success: true, 
      message: `User ${email} is now an admin!`,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
