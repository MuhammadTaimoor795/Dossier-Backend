const Joi = require("joi");

const verifyShema = Joi.object({
  token: Joi.string().required(),
  userId:Joi.string().required(),
});

module.exports = verifyShema;
