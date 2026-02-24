/**
 * Route handler for the welcome page.
 */
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('welcome', { menu: 'home' });
});

module.exports = router;
