
const authService = require("../../auth/helpers/authservice.helper");
const verifyShema = require("../../auth/schemas/forgot-password.schema");
const forgotPasswordController = async (req, res, next) => {
  try {
    
  const body = await verifyShema.validateAsync(req.body);
  const{email} = body
  //const origin = req.get('origin');
  //console.log("origin",origin)
  //return res.json(origin)
  await authService
    .forgotPassword(email, req.get('origin'))
    .then(() =>
      res.json({
        message: "Please check your email for password reset instructions",
      })
    )
    .catch(next);
  }  catch (error) {
    next(error) 

  }



     
};

module.exports = forgotPasswordController;
