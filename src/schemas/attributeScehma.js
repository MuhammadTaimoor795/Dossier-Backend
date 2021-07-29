const Joi = require("joi");

const attributeSchema = Joi.object({
  attribute_name: Joi.string().required(),
  attribute_value: Joi.string().required(),
});

module.exports = attributeSchema;