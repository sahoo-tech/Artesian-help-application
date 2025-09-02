const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshop.controller');

router.get('/', workshopController.getAllWorkshops);

module.exports = router;