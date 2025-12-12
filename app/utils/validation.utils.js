const Joi = require('joi');

/**
 * Validation schemas
 */
const schemas = {
    // User registration
    createUser: Joi.object({
        first_name: Joi.string().required().min(1).trim(),
        last_name: Joi.string().required().min(1).trim(),
        email: Joi.string().required().email().min(1).trim(),
        password: Joi.string().required().min(8).max(40)
            .pattern(/[A-Z]/, 'uppercase')
            .pattern(/[a-z]/, 'lowercase')
            .pattern(/[0-9]/, 'number')
            .pattern(/[^A-Za-z0-9]/, 'special')
    }).options({ allowUnknown: false }),

    // Login
    login: Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }).options({ allowUnknown: false }),

    // Create auction item
    createItem: Joi.object({
        name: Joi.string().required().min(1).trim(),
        description: Joi.string().required().min(1).trim(),
        starting_bid: Joi.number().required().min(0),
        end_date: Joi.number().required().greater(Date.now()),
        categories: Joi.array().items(Joi.number().integer()).optional()
    }).options({ allowUnknown: false }),

    // Place bid
    placeBid: Joi.object({
        amount: Joi.number().required().positive()
    }).options({ allowUnknown: false }),

    // Ask question
    askQuestion: Joi.object({
        question_text: Joi.string().required().min(1).trim()
    }).options({ allowUnknown: false }),

    // Answer question
    answerQuestion: Joi.object({
        answer_text: Joi.string().required().min(1).trim()
    }).options({ allowUnknown: false })
};

/**
 * Validate request against a schema
 */
function validate(data, schemaName) {
    const schema = schemas[schemaName];
    if (!schema) {
        throw new Error(`Schema ${schemaName} not found`);
    }

    const { error, value } = schema.validate(data);

    if (error) {
        let errorMessage = error.details[0].message;

        // Custom error messages for password validation
        if (error.details[0].context.name === 'uppercase') {
            errorMessage = 'Password must contain at least one uppercase letter';
        } else if (error.details[0].context.name === 'lowercase') {
            errorMessage = 'Password must contain at least one lowercase letter';
        } else if (error.details[0].context.name === 'number') {
            errorMessage = 'Password must contain at least one number';
        } else if (error.details[0].context.name === 'special') {
            errorMessage = 'Password must contain at least one special character';
        }

        return { error: errorMessage };
    }

    return { value };
}

module.exports = {
    validate,
    schemas
};
