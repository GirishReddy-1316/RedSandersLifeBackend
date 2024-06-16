const sendContactDetailsEmail = ({ custName, email, mobile, message }) => {

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Details</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #333;
            padding: 10px 0;
            display: flex;
            justify-content: left;
            border-bottom: 2px solid #ddd;
            text-align: left;
        }

        .header img {
            max-width: 150px;
        }

        .contact-details {
            width: 100%;
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            text-align: left;
        }

        .contact-info {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://jiyaba.com/assets/headerlogo-D5gKk0Pc.png" alt="Company Logo">
        </div>
        <div class="contact-details">
            <div class="contact-info">
                Name: ${custName}
            </div>
            <div class="contact-info">
                Email: ${email}
            </div>
            <div class="contact-info">
                Mobile: ${mobile}
            </div>
            <div class="contact-info">
                Message: ${message}
            </div>
        </div>
    </div>
</body>
</html>`;
};

module.exports = sendContactDetailsEmail;