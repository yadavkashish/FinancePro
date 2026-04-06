const Joi = require('joi');

// 1. Validation Schemas
const schemas = {
  signup: Joi.object({
    name: Joi.string().required().min(2),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('viewer', 'analyst', 'admin')
  }),
  transaction: Joi.object({
    // convert: true (default) ensures "7000" becomes 7000
    amount: Joi.number().positive().required().messages({
      'number.base': 'Amount must be a valid number',
      'number.positive': 'Amount must be greater than zero'
    }),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required().min(1),
    date: Joi.date().default(Date.now),
    notes: Joi.string().allow('', null).max(500)
  })
};

// 2. Validation Middleware
exports.validate = (schemaName) => (req, res, next) => {
  if (!schemas[schemaName]) return next();

  const { error, value } = schemas[schemaName].validate(req.body, { 
    abortEarly: false, 
    stripUnknown: true,
    convert: true // ✅ Enforces string-to-number conversion
  });

  if (error) {
    const message = error.details.map(el => el.message).join(', ');
    return res.status(400).json({ status: 'fail', message });
  }

  // ✅ Replaces req.body with the converted/cleaned values
  req.body = value;
  next();
};

// 3. Global Error Handler (The function server.js needs)
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  if (statusCode === 500) console.error('💥 INTERNAL ERROR:', err);

  res.status(statusCode).json({
    status: statusCode < 500 ? 'fail' : 'error',
    message: err.message || 'Something went very wrong!'
  });
};