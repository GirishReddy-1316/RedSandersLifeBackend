const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authentication token missing' });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(400).json({ message: 'Invalid authorization format' });
    }

    const token = tokenParts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log('JWT Verification Error:', error);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = authenticateJWT;
