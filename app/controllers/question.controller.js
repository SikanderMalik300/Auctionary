const questionModel = require('../models/question.model');
const { validate } = require('../utils/validation.utils');

/**
 * Ask a question
 */
function ask(req, res) {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found' });
    }

    const validation = validate(req.body, 'askQuestion');

    if (validation.error) {
        return res.status(400).json({ error_message: validation.error });
    }

    questionModel.askQuestion(itemId, req.user.user_id, validation.value.question_text, (err) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).send();
    });
}

/**
 * Answer a question
 */
function answer(req, res) {
    const questionId = parseInt(req.params.id);

    if (isNaN(questionId)) {
        return res.status(404).json({ error_message: 'Question not found' });
    }

    const validation = validate(req.body, 'answerQuestion');

    if (validation.error) {
        return res.status(400).json({ error_message: validation.error });
    }

    questionModel.answerQuestion(questionId, req.user.user_id, validation.value.answer_text, (err) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).send();
    });
}

/**
 * Get questions for an item
 */
function getQuestions(req, res) {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found' });
    }

    questionModel.getQuestions(itemId, (err, questions) => {
        if (err) {
            return res.status(err.status).json({ error_message: err.message });
        }

        res.status(200).json(questions);
    });
}

module.exports = {
    ask,
    answer,
    getQuestions
};
