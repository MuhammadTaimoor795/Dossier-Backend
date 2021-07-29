const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  
 // telegramId: [Joi.string().optional(), Joi.allow(null)],
  password: Joi.string().required(),
  fullname: Joi.string().required(),
  
});

module.exports = registerSchema;
