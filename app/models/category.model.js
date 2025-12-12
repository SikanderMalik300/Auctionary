const db = require('../../database');

/**
 * Get all categories
 */
function getAllCategories(callback) {
    const sql = 'SELECT category_id, name FROM categories ORDER BY name ASC';

    db.all(sql, [], (err, categories) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        callback(null, categories || []);
    });
}

/**
 * Associate categories with an item
 */
function associateCategories(itemId, categoryIds, callback) {
    if (!categoryIds || categoryIds.length === 0) {
        return callback(null);
    }

    // Validate that all category IDs exist
    const placeholders = categoryIds.map(() => '?').join(',');
    const checkSql = `SELECT category_id FROM categories WHERE category_id IN (${placeholders})`;

    db.all(checkSql, categoryIds, (err, validCategories) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (validCategories.length !== categoryIds.length) {
            return callback({ status: 400, message: 'Invalid category ID(s)' });
        }

        // Insert category associations
        const insertSql = 'INSERT INTO item_categories (item_id, category_id) VALUES (?, ?)';

        let completed = 0;
        const total = categoryIds.length;

        categoryIds.forEach(categoryId => {
            db.run(insertSql, [itemId, categoryId], (err) => {
                if (err) {
                    return callback({ status: 500, message: 'Database error' });
                }

                completed++;
                if (completed === total) {
                    callback(null);
                }
            });
        });
    });
}

module.exports = {
    getAllCategories,
    associateCategories
};
