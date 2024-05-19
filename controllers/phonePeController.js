const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");

const MERCHANT_ID = "PGTESTPAYUAT86";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const APP_BE_URL = "http://localhost:3000/api";

const initiatePayment = async (req, res, next) => {
    const amount = +req.query.amount;
    let userId = "MUID1234";
    let merchantTransactionId = uniqid();

    let normalPayLoad = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: amount * 100,
        redirectUrl: `http://localhost:5173/checkout?merchantTransactionId=${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };

    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

    let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

    try {
        const response = await axios.post(
            `${PHONE_PE_HOST_URL}/pg/v1/pay`,
            {
                request: base64EncodedPayload,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerifyChecksum,
                    accept: "application/json",
                },
            }
        );
        res.status(200).send(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

const validatePayment = async (req, res) => {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        let statusUrl =
            `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/` +
            merchantTransactionId;

        let string =
            `/pg/v1/status/${MERCHANT_ID}/` + merchantTransactionId + SALT_KEY;
        let sha256_val = sha256(string);
        let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

        try {
            const response = await axios.get(statusUrl, {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerifyChecksum,
                    "X-MERCHANT-ID": merchantTransactionId,
                    accept: "application/json",
                },
            });
            if (response.data && response.data.code === "PAYMENT_SUCCESS") {
                res.status(200).send(response.data);
            } else {
                res.redirect(`${clientURL}?merchantTransactionId=${merchantTransactionId}`)
            }
        } catch (error) {
            console.log(error);
            res.redirect(`${clientURL}?merchantTransactionId=${merchantTransactionId}`)
        }
    } else {
        res.status(500).send({ message: "Invalid merchant transaction ID." });
    }
};

module.exports = {
    initiatePayment,
    validatePayment,
};
