const db = require('../../database');
const { generateSalt, hashPassword, generateToken, comparePassword } = require('../utils/auth.utils');

/**
 * Create a new user
 */
function createUser(userData, callback) {
    const { first_name, last_name, email, password } = userData;

    // Generate salt and hash password
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    const sql = `INSERT INTO users (first_name, last_name, email, password, salt)
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [first_name, last_name, email, hashedPassword, salt], function (err) {
        if (err) {
            // Check for unique constraint violation
            if (err.message.includes('UNIQUE constraint failed')) {
                return callback({ status: 400, message: 'Email already exists' });
            }
            return callback({ status: 500, message: 'Database error' });
        }

        callback(null, { user_id: this.lastID });
    });
}

/**
 * Login user and generate session token
 */
function loginUser(email, password, callback) {
    const sql = 'SELECT * FROM users WHERE email = ?';

    db.get(sql, [email], (err, user) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!user) {
            return callback({ status: 400, message: 'Invalid email or password' });
        }

        // Check password
        if (!comparePassword(password, user.password, user.salt)) {
            return callback({ status: 400, message: 'Invalid email or password' });
        }

        // Check if user already has a session token
        if (user.session_token) {
            return callback(null, {
                user_id: user.user_id,
                session_token: user.session_token
            });
        }

        // Generate new session token
        const token = generateToken();
        const updateSql = 'UPDATE users SET session_token = ? WHERE user_id = ?';

        db.run(updateSql, [token, user.user_id], (err) => {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            callback(null, {
                user_id: user.user_id,
                session_token: token
            });
        });
    });
}

/**
 * Logout user by removing session token
 */
function logoutUser(userId, callback) {
    const sql = 'UPDATE users SET session_token = NULL WHERE user_id = ?';

    db.run(sql, [userId], (err) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        callback(null);
    });
}

/**
 * Get user by ID with their items
 */
function getUserById(userId, callback) {
    const userSql = 'SELECT user_id, first_name, last_name FROM users WHERE user_id = ?';

    db.get(userSql, [userId], (err, user) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!user) {
            return callback({ status: 404, message: 'User not found' });
        }

        // Get items user is selling
        const sellingSql = `
            SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id,
                   u.first_name, u.last_name
            FROM items i
            JOIN users u ON i.creator_id = u.user_id
            WHERE i.creator_id = ? AND i.end_date > ?
        `;

        db.all(sellingSql, [userId, Date.now()], (err, selling) => {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            // Get items user is bidding on
            const biddingSql = `
                SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id,
                       u.first_name, u.last_name
                FROM items i
                JOIN bids b ON i.item_id = b.item_id
                JOIN users u ON i.creator_id = u.user_id
                WHERE b.user_id = ? AND i.end_date > ?
            `;

            db.all(biddingSql, [userId, Date.now()], (err, biddingOn) => {
                if (err) {
                    return callback({ status: 500, message: 'Database error' });
                }

                // Get ended auctions (items created by user that have ended)
                const endedSql = `
                    SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id,
                           u.first_name, u.last_name
                    FROM items i
                    JOIN users u ON i.creator_id = u.user_id
                    WHERE i.creator_id = ? AND i.end_date <= ?
                `;

                db.all(endedSql, [userId, Date.now()], (err, auctionsEnded) => {
                    if (err) {
                        return callback({ status: 500, message: 'Database error' });
                    }

                    callback(null, {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        selling: selling || [],
                        bidding_on: biddingOn || [],
                        auctions_ended: auctionsEnded || []
                    });
                });
            });
        });
    });
}

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUserById
};
