const createOrderConfirmationEmail = (orderData) => {
    const {
        _id,
        products,
        totalPrice,
        shippingAddress
    } = orderData;
    console.log(orderData)


    // Format product list
    const productList = products?.map(product => {
        return `<li>${product.productId.name} by ${product.productId.brandName} - Quantity: ${product.quantity}</li>`;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #0046ad;
            color: #ffffff;
            padding: 10px 20px;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .content {
            padding: 20px;
            text-align: left;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            padding: 10px 20px;
            background: #f0f0f0;
            color: #333;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Order Confirmation</h1>

        </div>

        <div class="content">
            <h2>Hello ${shippingAddress?.custName},</h2>
            <p>Your order has been successfully placed with the following details:</p>
            <p>Your Order ID: ${_id}</p>
            <ul>
                ${productList}
            </ul>
            <p>Total Price: ${totalPrice}</p>
            <p>Shipping Address: ${shippingAddress?.street}, ${shippingAddress?.city}, ${shippingAddress?.state}, ${shippingAddress?.country}</p>
        </div>
        <div class="footer">
            <p>Thank you for your purchase.</p>
        </div>
    </div>
</body>
</html>`;
};

module.exports = createOrderConfirmationEmail;
