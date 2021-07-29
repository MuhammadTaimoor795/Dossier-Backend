const express = require("express");
const router = express.Router();

// all controllers
const signup=require("../controller/client/ClientSignUp");


router.post("/client-signup",signup)

module.exports = router;
