const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

class AuthService {
    /**
     * Generate access and refresh tokens
     * @param {Object} user 
     * @param {String} userType - 'user' or 'admin'
     */
    static generateTokens(user, userType = 'user') {
        const payload = {
            id: user._id,
            type: userType
        };

        const accessToken = jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn
        });

        const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
            expiresIn: jwtConfig.refreshExpiresIn
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verify Token
     * @param {String} token 
     * @param {Boolean} isRefresh 
     */
    static verifyToken(token, isRefresh = false) {
        const secret = isRefresh ? jwtConfig.refreshSecret : jwtConfig.secret;
        return jwt.verify(token, secret);
    }
}

module.exports = AuthService;
