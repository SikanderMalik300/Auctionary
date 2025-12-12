const db = require('../../database');

/**
 * Middleware to check if user is authenticated
 */
function requireAuth(req, res, next) {
    const token = req.get('X-Authorization');

    if (!token) {
        return res.status(401).json({ error_message: 'Unauthorized' });
    }

    const sql = 'SELECT user_id, first_name, last_name, email FROM users WHERE session_token = ?';

    db.get(sql, [token], (err, user) => {
        if (err) {
            return res.status(500).json({ error_message: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error_message: 'Unauthorized' });
        }

        // Attach user to request object
        req.user = user;
        next();
    });
}

/**
 * Optional auth - attaches user if token is provided, but doesn't fail if not
 */
function optionalAuth(req, res, next) {
    const token = req.get('X-Authorization');

    if (!token) {
        req.user = null;
        return next();
    }

    const sql = 'SELECT user_id, first_name, last_name, email FROM users WHERE session_token = ?';

    db.get(sql, [token], (err, user) => {
        if (err) {
            req.user = null;
            return next();
        }

        req.user = user || null;
        next();
    });
}

module.exports = {
    requireAuth,
    optionalAuth
};
