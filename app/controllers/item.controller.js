const itemModel = require('../models/item.model');
const { validate } = require('../utils/validation.utils');

/**
 * Create a new item
 */
function create(req, res) {
    const validation = validate(req.body, 'createItem');

    if (validation.error) {
        return res.status(400).json({ error_message: validation.error });
    }

    itemModel.createItem(validation.value, req.user.user_id, (err, result) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(201).json(result);
    });
}

/**
 * Get item by ID
 */
function getById(req, res) {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found' });
    }

    itemModel.getItemById(itemId, (err, result) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).json(result);
    });
}

/**
 * Search items
 */
function search(req, res) {
    const { q, limit, offset, status, category } = req.query;

    // Parse limit and offset
    const parsedLimit = limit ? parseInt(limit) : 10;
    const parsedOffset = offset ? parseInt(offset) : 0;
    const categoryId = category ? parseInt(category) : null;

    // Handle status filters
    if (status) {
        // Status filters require authentication
        if (!req.user) {
            return res.status(400).json({ error_message: 'Authentication required for status filters' });
        }

        const validStatuses = ['OPEN', 'BID', 'ARCHIVE'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error_message: 'Invalid status value' });
        }

        if (status === 'OPEN') {
            itemModel.getUserOpenItems(req.user.user_id, parsedLimit, parsedOffset, q, (err, items) => {
                if (err) {
                    return res.status(err.status).json({ error_message: err.message });
                }
                res.status(200).json(items);
            });
        } else if (status === 'BID') {
            itemModel.getUserBidItems(req.user.user_id, parsedLimit, parsedOffset, q, (err, items) => {
                if (err) {
                    return res.status(err.status).json({ error_message: err.message });
                }
                res.status(200).json(items);
            });
        } else if (status === 'ARCHIVE') {
            itemModel.getUserArchiveItems(req.user.user_id, parsedLimit, parsedOffset, q, (err, items) => {
                if (err) {
                    return res.status(err.status).json({ error_message: err.message });
                }
                res.status(200).json(items);
            });
        }
    } else {
        // General search with optional category filter
        itemModel.searchItems(q, parsedLimit, parsedOffset, categoryId, (err, items) => {
            if (err) {
                return res.status(err.status).json({ error_message: err.message });
            }
            res.status(200).json(items);
        });
    }
}

module.exports = {
    create,
    getById,
    search
};
