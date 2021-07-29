const Joi = require("joi");

const udpateSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  streetAddress: Joi.string().required(),
  country: Joi.string().required(),
  state:Joi.string().required(),
  zipcode:Joi.string().required(),
  phone:Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),

});

module.exports = udpateSchema;
