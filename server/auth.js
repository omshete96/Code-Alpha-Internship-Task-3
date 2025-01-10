const jwt = require('jsonwebtoken');

// Authenticate JWT token
const authenticate = (token) => {
    try {
        const decoded = jwt.verify(token, 'secretKey');
        return decoded;
    } catch (err) {
        return null;
    }
};

module.exports = { authenticate };
