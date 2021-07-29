const db = require("../../../models");
const crypto = require("crypto");
const registerSchema = require("../../auth/schemas/register.schema");
const bcrypt = require("bcrypt");
const authService = require("../../auth/helpers/authservice.helper");
const LawyerSignUp = async (req, res, next) => {
  try {
    const body = await registerSchema.validateAsync(req.body);
    const ipAddress = req.ip;
    const origin = req.get('origin');
     //res.json(origin)
    const { email, password,fullname } = body;

    const dbUsers = await db.User.findOne({
      where: {
        email: email,
      },
    });
    if (dbUsers) {
      throw new Error("You are already registered with this email. Try to login into the site")    
    }
    const randomTokenString = async () => {
      return crypto.randomBytes(40).toString("hex");
    };
    const hashPassword = await bcrypt.hash(password, 10);
    const random=await (randomTokenString());
    console.log("random",random);
    console.log("hashed", hashPassword);
    const user = await db.User.create({
      email,
      password: hashPassword,
      role:1,
      emailVerified: false,
      active: true,
      verificationToken:random,
      firstName:fullname
    });
  
    
    const uuid = user.uuid;
    console.log("id", user.uuid);
    const authRes = await authService.authenticate({
      uuid,
      password,
      ipAddress,
    });
    // //console.log("authRes", authRes);

    authService.setTokenCookie(res, authRes.refreshToken);
      const send=await authService.sendVerificationEmail(user, origin);
      console.log("SENDDD ::",send)
      if(send)
      {
        return res.status(200).json({
          data: " Account created account verfication mail send to your account",
          error: false,
          success: true
        });

     }
   
    res.json(user).status(201);
  }  catch (error) {
    console.log("server error", error.message);
    next(error) 

  }

};

module.exports = LawyerSignUp;
