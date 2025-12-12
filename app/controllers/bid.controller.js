const bidModel = require('../models/bid.model');
const { validate } = require('../utils/validation.utils');

/**
 * Place a bid
 */
function place(req, res) {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found' });
    }

    const validation = validate(req.body, 'placeBid');

    if (validation.error) {
        return res.status(400).json({ error_message: validation.error });
    }

    bidModel.placeBid(itemId, req.user.user_id, validation.value.amount, (err) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(201).send();
    });
}

/**
 * Get bid history
 */
function getHistory(req, res) {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found' });
    }

    bidModel.getBidHistory(itemId, (err, bids) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).json(bids);
    });
}

module.exports = {
    place,
    getHistory
};
