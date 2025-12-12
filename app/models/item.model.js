const db = require('../../database');
const { cleanText } = require('../utils/profanity.utils');
const categoryModel = require('./category.model');

/**
 * Create a new auction item
 */
function createItem(itemData, creatorId, callback) {
    const { name, description, starting_bid, end_date, categories } = itemData;
    const start_date = Date.now();

    // Clean profanity from name and description
    const cleanedName = cleanText(name);
    const cleanedDescription = cleanText(description);

    const sql = `INSERT INTO items (name, description, starting_bid, start_date, end_date, creator_id)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [cleanedName, cleanedDescription, starting_bid, start_date, end_date, creatorId], function (err) {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        const itemId = this.lastID;

        // Associate categories if provided
        if (categories && Array.isArray(categories) && categories.length > 0) {
            categoryModel.associateCategories(itemId, categories, (err) => {
                if (err) {
                    return callback(err);
                }

                callback(null, { item_id: itemId });
            });
        } else {
            callback(null, { item_id: itemId });
        }
    });
}

/**
 * Get item by ID with current bid information
 */
function getItemById(itemId, callback) {
    const sql = `
        SELECT i.*, u.first_name, u.last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
        WHERE i.item_id = ?
    `;

    db.get(sql, [itemId], (err, item) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!item) {
            return callback({ status: 404, message: 'Item not found' });
        }

        // Get current highest bid
        const bidSql = `
            SELECT b.amount, b.user_id, u.first_name, u.last_name
            FROM bids b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.item_id = ?
            ORDER BY b.amount DESC
            LIMIT 1
        `;

        db.get(bidSql, [itemId], (err, bid) => {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            const result = {
                item_id: item.item_id,
                creator_id: item.creator_id,
                name: item.name,
                description: item.description,
                starting_bid: item.starting_bid,
                start_date: item.start_date,
                end_date: item.end_date,
                first_name: item.first_name,
                last_name: item.last_name,
                current_bid: bid ? bid.amount : item.starting_bid,
                current_bid_holder: bid ? {
                    user_id: bid.user_id,
                    first_name: bid.first_name,
                    last_name: bid.last_name
                } : null
            };

            callback(null, result);
        });
    });
}

/**
 * Search items
 */
function searchItems(query, limit, offset, categoryId, callback) {
    limit = limit || 10;
    offset = offset || 0;

    let sql = `
        SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id,
               u.first_name, u.last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
    `;

    const params = [];
    const whereClauses = [];

    // Join with categories if filtering by category
    if (categoryId) {
        sql += ` JOIN item_categories ic ON i.item_id = ic.item_id`;
        whereClauses.push('ic.category_id = ?');
        params.push(categoryId);
    }

    // Search by query
    if (query) {
        whereClauses.push('(i.name LIKE ? OR i.description LIKE ?)');
        const searchPattern = `%${query}%`;
        params.push(searchPattern, searchPattern);
    }

    if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(sql, params, (err, items) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        callback(null, items || []);
    });
}

/**
 * Get user's open items (items they're selling)
 */
function getUserOpenItems(userId, limit, offset, query, callback) {
    limit = limit || 10;
    offset = offset || 0;

    let sql = `
        SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id,
               u.first_name, u.last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
        WHERE i.creator_id = ? AND i.end_date > ?
    `;

    const params = [userId, Date.now()];

    // Add query filter if provided
    if (query) {
        sql += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
        const searchPattern = `%${query}%`;
        params.push(searchPattern, searchPattern);
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(sql, params, (err, items) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        callback(null, items || []);
    });
}

/**
 * Get items user is bidding on
 */
function getUserBidItems(userId, limit, offset, query, callback) {
    limit = limit || 10;
    offset = offset || 0;

    let sql = `
        SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id,
               u.first_name, u.last_name
        FROM items i
        JOIN bids b ON i.item_id = b.item_id
        JOIN users u ON i.creator_id = u.user_id
        WHERE b.user_id = ? AND i.end_date > ?
    `;

    const params = [userId, Date.now()];

    // Add query filter if provided
    if (query) {
        sql += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
        const searchPattern = `%${query}%`;
        params.push(searchPattern, searchPattern);
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(sql, params, (err, items) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        callback(null, items || []);
    });
}

/**
 * Get user's archived items (ended auctions they created)
 */
function getUserArchiveItems(userId, limit, offset, query, callback) {
    limit = limit || 10;
    offset = offset || 0;

    let sql = `
        SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id,
               u.first_name, u.last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
        WHERE i.creator_id = ? AND i.end_date <= ?
    `;

    const params = [userId, Date.now()];

    // Add query filter if provided
    if (query) {
        sql += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
        const searchPattern = `%${query}%`;
        params.push(searchPattern, searchPattern);
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(sql, params, (err, items) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        callback(null, items || []);
    });
}

module.exports = {
    createItem,
    getItemById,
    searchItems,
    getUserOpenItems,
    getUserBidItems,
    getUserArchiveItems
};
