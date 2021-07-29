const express = require("express");
const router = express.Router();

// all controllers
const login=require("../controller/common/userLoginController");
const verify=require("../controller/common/verify-email.controller")
const forgetpassword=require("../controller/common/forgot-password.controller")
const resetPassword=require("../controller/common/reset-password.controller")
const revoketok=require('../controller/common/revoke-token.controller')
router.post("/login",login)


router.patch("/verify-email",verify)
router.post("/forget-password",forgetpassword)

router.patch("/reset-password",resetPassword)
router.post("/revoketoken",revoketok)
module.exports = router;
