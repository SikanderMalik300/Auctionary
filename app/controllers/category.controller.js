const categoryModel = require('../models/category.model');

/**
 * Get all categories
 */
function getAll(req, res) {
    categoryModel.getAllCategories((err, categories) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).json(categories);
    });
}

module.exports = {
    getAll
};
