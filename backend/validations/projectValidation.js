import Joi from 'joi';

export const projectSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Project name is required'
  }),
  code: Joi.string().required().messages({
    'string.empty': 'Project code is required'
  }),
  department: Joi.string().required().messages({
    'string.empty': 'Department is required'
  }),
  owner: Joi.string().required().messages({
    'string.empty': 'Owner is required'
  }),
  status: Joi.string().valid('ACTIVE', 'COMPLETED', 'DELAYED', 'PLANNING').default('PLANNING'),
  health: Joi.string().valid('GREEN', 'YELLOW', 'RED').default('GREEN'),
  budget: Joi.number().min(0).default(0),
  spent: Joi.number().min(0).default(0),
  progress: Joi.number().min(0).max(100).default(0),
  gate: Joi.string().allow('', null),
  targetDate: Joi.date().iso().allow(null),
  description: Joi.string().allow('', null),
  priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').default('MEDIUM'),
  lifecycleStage: Joi.string().allow('', null)
});

// Middleware to validate project payload
export const validateProject = (req, res, next) => {
  const { error } = projectSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(err => err.message)
    });
  }
  next();
};
