const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const usersController = require("../controllers/usersController")

router.post('/otp', usersController.generateOTP);
router.post('/verify-otp', usersController.verifyOTP);
router.post('/registration', usersController.createUser);
router.post('/login', usersController.loginUser);

router.post('/forget-password', usersController.sendOTP);
router.post('/verify-password-otp', usersController.verifyPasswordOTP);
router.post('/reset-password', usersController.resetPassword);

router.post('/logout', authenticateJWT, usersController.logout);
router.get("/profile", authenticateJWT, usersController.getProfile)


module.exports = router;
