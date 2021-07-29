const express = require("express");
const router = express.Router();

// all controllers
const signup=require("../controller/lawyer/LawyerSignUp");


router.post("/lawyer-signup",signup)

module.exports = router;
