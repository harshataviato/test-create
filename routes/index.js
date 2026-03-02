const express = require('express');
const router = express.Router();

/**
 * Welcome Controller
 * Renders the home page.
 */
router.get('/', (req, res) => {
    res.render('welcome');
});

module.exports = router;
