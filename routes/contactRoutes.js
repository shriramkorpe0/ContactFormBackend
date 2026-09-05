const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');

// POST /api/contact  ->  handled by submitContact in contactController.js
router.post('/contact', submitContact);

module.exports = router;
