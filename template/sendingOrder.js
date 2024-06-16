const createOrderConfirmationEmail = (orderData) => {
    const {
        _id,
        products,
        totalPrice,
        shippingAddress,
        paymentMethod
    } = orderData;


    // Format product list
    const productList = products?.map(product => {
        return `
            <div class="product-container">
                <div class="product-img">
                    <img src="${product.productId.image}" alt="Product Image">
                    <div>
                        <p><strong>${product.productId.name}</strong></p>
                        <p>Qty: ${product.quantity}</p>
                    </div>
                </div>
                <div class="product-price">
                    <p>Price: ₹${product.productId.price}</p>
                </div>
            </div>`;
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

        .order-details {
            width: 100%;
            background-color: #f9f9f9;
            border-radius: 8px;
        }

        .product-container {
            width: 80%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            gap : 20px;
            border-bottom: 1px solid #ddd;
            padding: 10px;
        }

        .product-img {
            display: flex;
            align-items: center;
            margin-right: 10px;
            width: 100%;
        }

        .product-img img {
            max-width: 50px;
            margin-right: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .product-price {
            text-align: right;
             width: 100%;
        }

        .order-summary,
        .footer-delivery {
            margin: 20px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #f9f9f9;
        }

        .order-summary .total {
            font-weight: bold;
            color: #333;
            font-size: 18px;
        }

        .order-summary p {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            text-align: left;
            font-size: 12px;
        }

        .delivery-address p,
        .payment-mode p {
            margin: 5px 0;
        }

        .section-title {
            margin-bottom: 10px;
            font-weight: bold;
            color: #333;
        }

        .section-subtitle {
            width: 100%;
            font-weight: bold;
            color: #333;
            text-align: center;
        }

        .footer-delivery {
            display: flex;
            justify-content: space-between;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://jiyaba.com/assets/headerlogo-D5gKk0Pc.png" alt="Company Logo">
        </div>
        <div class="order-details">
            ${productList}
        </div>
        <div class="order-summary">
            <p>Sub Total: ₹${totalPrice}</p>
            <p>Standard Delivery: ₹2.64</p>
            <p class="total">Total Amount: ₹${(totalPrice + 2.64).toFixed(2)}</p>
        </div>
        <div class="footer-delivery">
            <div class="delivery-address">
                <div class="section-title">Delivery Address</div>
                <p>${shippingAddress.custName}</p>
                <p>${shippingAddress.street}, ${shippingAddress.city}</p>
                <p>${shippingAddress.state}, ${shippingAddress.country} - ${shippingAddress?.pin}</p>
                <p>Mobile: ${shippingAddress.mobile}</p>
            </div>
            <div class="payment-mode">
                <div class="section-title">Mode of Payment</div>
                <p class="section-subtitle"> Prepaid</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

module.exports = createOrderConfirmationEmail;
