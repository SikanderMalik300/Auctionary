const crypto = require('crypto');

/**
 * Generate a random salt for password hashing
 */
function generateSalt() {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Hash a password with a salt
 */
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

/**
 * Generate a session token
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Compare a password with a hashed password
 */
function comparePassword(password, hashedPassword, salt) {
    const hash = hashPassword(password, salt);
    return hash === hashedPassword;
}

module.exports = {
    generateSalt,
    hashPassword,
    generateToken,
    comparePassword
};
