const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');

router.get('/', vetController.showVetList);
router.get('.html', vetController.showVetList); // Support .html extension for legacy compatibility

module.exports = router;
