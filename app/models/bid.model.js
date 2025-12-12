const db = require('../../database');

/**
 * Place a bid on an item
 */
function placeBid(itemId, userId, amount, callback) {
    // First check if item exists and get current highest bid
    const itemSql = `
        SELECT i.creator_id, i.item_id
        FROM items i
        WHERE i.item_id = ?
    `;

    db.get(itemSql, [itemId], (err, item) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!item) {
            return callback({ status: 404, message: 'Item not found' });
        }

        // Check if user is trying to bid on their own item
        if (item.creator_id === userId) {
            return callback({ status: 403, message: 'Cannot bid on your own item' });
        }

        // Get current highest bid
        const bidSql = `
            SELECT MAX(amount) as current_bid
            FROM bids
            WHERE item_id = ?
        `;

        db.get(bidSql, [itemId], (err, result) => {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            // Also get starting bid
            const startBidSql = 'SELECT starting_bid FROM items WHERE item_id = ?';

            db.get(startBidSql, [itemId], (err, itemData) => {
                if (err) {
                    return callback({ status: 500, message: 'Database error' });
                }

                const currentBid = result.current_bid || itemData.starting_bid;

                // Bid must be greater than current bid (not equal)
                if (amount <= currentBid) {
                    return callback({ status: 400, message: 'Bid must be greater than current bid' });
                }

                // Insert the bid
                const insertSql = `
                    INSERT INTO bids (item_id, user_id, amount, timestamp)
                    VALUES (?, ?, ?, ?)
                `;

                const timestamp = Date.now();

                db.run(insertSql, [itemId, userId, amount, timestamp], function (err) {
                    if (err) {
                        return callback({ status: 500, message: 'Database error' });
                    }

                    callback(null);
                });
            });
        });
    });
}

/**
 * Get bid history for an item
 */
function getBidHistory(itemId, callback) {
    // First check if item exists
    const itemSql = 'SELECT item_id FROM items WHERE item_id = ?';

    db.get(itemSql, [itemId], (err, item) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!item) {
            return callback({ status: 404, message: 'Item not found' });
        }

        // Get all bids for the item
        const bidSql = `
            SELECT b.item_id, b.amount, b.timestamp, b.user_id,
                   u.first_name, u.last_name
            FROM bids b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.item_id = ?
            ORDER BY b.amount DESC
        `;

        db.all(bidSql, [itemId], (err, bids) => {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            callback(null, bids || []);
        });
    });
}

module.exports = {
    placeBid,
    getBidHistory
};
