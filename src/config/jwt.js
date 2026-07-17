const jwtConfig = {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES || '30d'
};

module.exports = jwtConfig;
