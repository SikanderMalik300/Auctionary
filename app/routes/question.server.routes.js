const questionController = require('../controllers/question.controller');
const { requireAuth } = require('../middleware/auth.middleware');

module.exports = function (app) {
    // Ask a question (requires authentication)
    app.post('/item/:id/question', requireAuth, questionController.ask);

    // Get questions for an item
    app.get('/item/:id/question', questionController.getQuestions);

    // Answer a question (requires authentication)
    app.post('/question/:id', requireAuth, questionController.answer);
};
