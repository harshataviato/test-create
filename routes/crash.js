const express = require('express');
const router = express.Router();

/**
 * Crash Controller
 * Demonstrates error handling.
 */
router.get('/', (req, res) => {
    throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

module.exports = router;
