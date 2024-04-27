const express = require("express");
const phonePeRouter = express.Router();
const phonePeController = require("../controllers/phonePeController");

phonePeRouter.get("/", (req, res) => {
    res.send("PhonePe Integration APIs!");
});

phonePeRouter.get("/pay", phonePeController.initiatePayment);
phonePeRouter.get("/validate/:merchantTransactionId", phonePeController.validatePayment);

module.exports = phonePeRouter;
