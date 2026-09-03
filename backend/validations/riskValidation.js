import Joi from 'joi';

export const riskSchema = Joi.object({
  ref: Joi.string().required().messages({
    'string.empty': 'Reference is required'
  }),
  subject: Joi.string().required().messages({
    'string.empty': 'Subject is required'
  }),
  description: Joi.string().required().messages({
    'string.empty': 'Description is required'
  }),
  severity: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').default('MEDIUM'),
  owner: Joi.string().required().messages({
    'string.empty': 'Owner is required'
  }),
  category: Joi.string().valid('Risk', 'Issue').default('Risk'),
  projectRef: Joi.string().allow('', null),
  status: Joi.string().default('OPEN')
});

// Middleware to validate risk payload
export const validateRisk = (req, res, next) => {
  const { error } = riskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};
