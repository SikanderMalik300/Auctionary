const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

module.exports = function (app) {
    // Create user
    app.post('/users', userController.create);

    // Login
    app.post('/login', userController.login);

    // Logout (requires authentication)
    app.post('/logout', requireAuth, userController.logout);

    // Get user by ID
    app.get('/users/:id', userController.getById);
};
