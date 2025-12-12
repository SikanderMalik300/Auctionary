const filter = require('leo-profanity');

/**
 * Clean profanity from text
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text with profanity replaced by ***
 */
function cleanText(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    return filter.clean(text, '***');
}

module.exports = {
    cleanText
};
