const express = require('express');
const contactRouter = express.Router();
const contactController = require('../controllers/contactController');

contactRouter.post('/contact', contactController.saveContactDetails);

module.exports = contactRouter;