const userModel = require('../models/user.model');
const { validate } = require('../utils/validation.utils');

/**
 * Create a new user
 */
function create(req, res) {
    const validation = validate(req.body, 'createUser');

    if (validation.error) {
        return res.status(400).json({ error_message: validation.error });
    }

    userModel.createUser(validation.value, (err, result) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(201).json(result);
    });
}

/**
 * Login user
 */
function login(req, res) {
    const validation = validate(req.body, 'login');

    if (validation.error) {
        return res.status(400).json({ error_message: validation.error });
    }

    const { email, password } = validation.value;

    userModel.loginUser(email, password, (err, result) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).json(result);
    });
}

/**
 * Logout user
 */
function logout(req, res) {
    userModel.logoutUser(req.user.user_id, (err) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).send();
    });
}

/**
 * Get user by ID
 */
function getById(req, res) {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        return res.status(404).json({ error_message: 'User not found' });
    }

    userModel.getUserById(userId, (err, result) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).json(result);
    });
}

module.exports = {
    create,
    login,
    logout,
    getById
};
