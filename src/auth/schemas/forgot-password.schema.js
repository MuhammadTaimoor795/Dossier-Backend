const Joi = require("joi");

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = forgotPasswordSchema;
