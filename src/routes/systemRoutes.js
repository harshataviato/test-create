const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('welcome', { menu: 'home' });
});

router.get('/oups', (req, res) => {
  throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

module.exports = router;
