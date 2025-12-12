const itemController = require('../controllers/item.controller');
const bidController = require('../controllers/bid.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');

module.exports = function (app) {
    // Create item (requires authentication)
    app.post('/item', requireAuth, itemController.create);

    // Get item by ID
    app.get('/item/:id', itemController.getById);

    // Place bid (requires authentication)
    app.post('/item/:id/bid', requireAuth, bidController.place);

    // Get bid history
    app.get('/item/:id/bid', bidController.getHistory);

    // Search items (optional authentication for status filters)
    app.get('/search', optionalAuth, itemController.search);
};
