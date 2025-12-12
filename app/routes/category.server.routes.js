const categoryController = require('../controllers/category.controller');

module.exports = function (app) {
    // Get all categories
    app.get('/categories', categoryController.getAll);
};
