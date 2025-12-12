const db = require('../../database');
const { cleanText } = require('../utils/profanity.utils');

/**
 * Ask a question on an item
 */
function askQuestion(itemId, userId, questionText, callback) {
    // First check if item exists and get creator
    const itemSql = 'SELECT creator_id FROM items WHERE item_id = ?';

    db.get(itemSql, [itemId], (err, item) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!item) {
            return callback({ status: 404, message: 'Item not found' });
        }

        // Check if user is trying to ask question on their own item
        if (item.creator_id === userId) {
            return callback({ status: 403, message: 'Cannot ask question on your own item' });
        }

        // Clean profanity from question text
        const cleanedQuestionText = cleanText(questionText);

        // Insert the question
        const sql = `
            INSERT INTO questions (question, answer, asked_by, item_id)
            VALUES (?, NULL, ?, ?)
        `;

        db.run(sql, [cleanedQuestionText, userId, itemId], function (err) {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            callback(null);
        });
    });
}

/**
 * Answer a question
 */
function answerQuestion(questionId, userId, answerText, callback) {
    // First check if question exists and get the item creator
    const sql = `
        SELECT q.question_id, i.creator_id
        FROM questions q
        JOIN items i ON q.item_id = i.item_id
        WHERE q.question_id = ?
    `;

    db.get(sql, [questionId], (err, question) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!question) {
            return callback({ status: 404, message: 'Question not found' });
        }

        // Check if user is the item creator
        if (question.creator_id !== userId) {
            return callback({ status: 403, message: 'Only the auction creator can answer questions' });
        }

        // Update the question with the answer
        const updateSql = 'UPDATE questions SET answer = ? WHERE question_id = ?';

        db.run(updateSql, [answerText, questionId], (err) => {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            callback(null);
        });
    });
}

/**
 * Get all questions for an item
 */
function getQuestions(itemId, callback) {
    // First check if item exists
    const itemSql = 'SELECT item_id FROM items WHERE item_id = ?';

    db.get(itemSql, [itemId], (err, item) => {
        if (err) {
            return callback({ status: 500, message: 'Database error' });
        }

        if (!item) {
            return callback({ status: 404, message: 'Item not found' });
        }

        // Get all questions for the item (sorted by newest first)
        const sql = `
            SELECT question_id, question as question_text, answer as answer_text
            FROM questions
            WHERE item_id = ?
            ORDER BY question_id DESC
        `;

        db.all(sql, [itemId], (err, questions) => {
            if (err) {
                return callback({ status: 500, message: 'Database error' });
            }

            callback(null, questions || []);
        });
    });
}

module.exports = {
    askQuestion,
    answerQuestion,
    getQuestions
};
