/**
 * Validation middleware using express-validator
 * Add input validation to protect against invalid data
 */

const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Member validation rules
const memberValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('contact1').optional().isMobilePhone().withMessage('Invalid phone number'),
    handleValidationErrors
];

// Staff validation rules  
const staffValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
    handleValidationErrors
];

// Sale/Invoice validation rules
const saleValidation = [
    body('memberID').notEmpty().withMessage('Member is required'),
    body('amount').isNumeric().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    handleValidationErrors
];

module.exports = {
    memberValidation,
    staffValidation,
    saleValidation,
    handleValidationErrors
};
