/**
 * Route handler for testing error pages.
 */
const express = require('express');
const router = express.Router();

router.get('/oups', (req, res, next) => {
    // Simulate an error
    const err = new Error('Expected: controller used to showcase what happens when an exception is thrown');
    next(err);
});

module.exports = router;
