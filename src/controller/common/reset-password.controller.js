
const authService = require("../../auth/helpers/authservice.helper");

const resetPasswordController = async (req, res, next) => {
  authService
    .resetPassword(req.body)
    .then(() =>
      res.json({ message: "Password reset successful, you can now login" })
    )
    .catch(next);
};

module.exports = resetPasswordController;
