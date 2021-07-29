const verifyShema = require("../../auth/schemas/verify-email.schema");

const authService = require("../../auth/helpers/authservice.helper");

const verifyEmail = async (req, res, next) => {
  try {
    const body = await verifyShema.validateAsync(req.body);
    const{token , userId} = body
    const veirfy = await authService.verifyEmail(token,userId);
    console.log("Verify:::::",veirfy)
    if (!veirfy)
    {
      return res.json("you are not verifed try again ")
    }
    return res.json({
      accessToken:veirfy
    })
  }  catch (error) {
    console.log("server error", error.message);
    next(error) 

  }





};

module.exports = verifyEmail;
