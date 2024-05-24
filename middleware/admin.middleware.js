const jwt = require('jsonwebtoken');

exports.adminAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.adminId;
        next();
    } catch (error) {
        console.error('Error authenticating admin:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};