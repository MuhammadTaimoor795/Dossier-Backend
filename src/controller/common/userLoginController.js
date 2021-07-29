const jwt = require("jsonwebtoken");
const db = require("../../../models");
//const config = require("../../../../config");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const loginSchema = require("../../auth/schemas/login.schema");
const authService = require("../../auth/helpers/authservice.helper");

const loginController = async (req, res, next) => {
  try {
    const body = await loginSchema.validateAsync(req.body);
    const { email, password } = body;
    const ipAddress = req.ip;

    const dbUser = await db.User.findOne({
      where: {
        email
      },
    });

    if (!dbUser) {
      throw new Error("email not found!, Please enter correct email.")    
    }

    const uuid = dbUser.uuid;

    const compare = await bcrypt.compareSync(password, dbUser.password);

    if (!compare) {
      throw new Error("Incorrect Password!");    
    }

    console.log("dbUser.id", dbUser.uuid);
    const authRes = await authService.authenticate({
      uuid,
      password,
      ipAddress,
    });
    authService.setTokenCookie(res, authRes.refreshToken);
   console.log("authRes", authRes);
    //res.json(authRes).status(201);
    res.status(200).json({
      data: authRes,
      error: false,
      success: true
    });
    //res.json("welcome :"+authRes.email).status(201);
  } catch (error) {
    console.log("server error", error.message);
    next(error)
  }




};

// async function revokeToken({ token, ipAddress }) {
//   const refreshToken = await getRefreshToken(token);

//   // revoke token and save
//   refreshToken.revoked = Date.now();
//   refreshToken.revokedByIp = ipAddress;
//   await refreshToken.save();
// }
// async function getRefreshTokens(userId) {
//   // check that user exists
//   await getUser(userId);

//   // return refresh tokens for user
//   const refreshTokens = await db.RefreshToken.find({ user: userId });
//   return refreshTokens;
// }

// async function getUser(id) {
//   if (!db.isValidId(id)) throw "User not found";
//   const user = await db.User.findById(id);
//   if (!user) throw "User not found";
//   return user;
// }

// async function getRefreshToken(token) {
//   const refreshToken = await db.RefreshToken.findOne({ token }).populate(
//     "user"
//   );
//   if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
//   return refreshToken;
// }

module.exports = loginController;
