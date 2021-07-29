require("dotenv")
const db = require("../../../models");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const nodemailer = require("nodemailer");
//const Role = require("../../../auth/helpers/role.helper");
const { Op } = require("sequelize");
const bcrypt = require('bcrypt')

const authenticate = async ({ uuid, password,ipAddress }) => {
  const user = await db.User.findOne({
    where: {
      uuid: uuid,
    },
  });
  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(user);
 

  const refreshToken = await generateRefreshToken(user.id, ipAddress);
  // return basic details and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: refreshToken.token,
  };
};

const refreshToken = async ({ token, ipAddress }) => {
  const refreshToken = await getRefreshToken(token);
  const { userId } = refreshToken;
  console.log("1", userId);
  // replace old refresh token with a new one and save
  const newRefreshToken = await generateRefreshToken(userId, ipAddress);

  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  refreshToken.userId = userId;
  // console.log("radaf", refreshToken);
  const dadad = await db.RefreshToken.create({
    // expires: JSON.stringify(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
    revoked: Date.now(),
    revokedByIp: ipAddress,
    replacedByToken: newRefreshToken.token,
    userId: userId,
    token: refreshToken.token,
    isActive: true,
  });
  // generate new jwt
  const user = await db.User.findOne({
    where: { id: userId },
  });

  const jwtToken = generateJwtToken(user);

  // return basic details and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
};

const revokeToken = async ({ token, ipAddress }) => {
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.isActive = false;
  refreshToken.isExpired = true;

  const data = await db.RefreshToken.update(refreshToken, {
    where: {
      token,
    },
  });

  return data;
};

const getAll = async () => {
  const users = await db.User.findAll();
  return users.map((x) => basicDetails(x));
};

const getById = async (id) => {
  const user = await getUser(id);
  return basicDetails(user);
};

const getRefreshTokens = async (userId) => {
  // check that user exists
  await getUser(userId);

  // return refresh tokens for user
  const refreshTokens = await db.RefreshToken.find({ where: { id: userId } });
  return refreshTokens;
};

// helper functions

const getUser = async (id) => {
  if (!db.isValidId(id)) throw "User not found";
  const user = await db.User.findOne({
    where: {
      id,
    },
  });
  if (!user) throw "User not found";
  return user;
};

const getRefreshToken = async (token) => {
  const refreshToken = await db.RefreshToken.findOne({ where: { token } });
  console.log("adfa", refreshToken);
  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
};

// generate new jwt token
const generateJwtToken = (user) => {
  console.log('gf', process.env.jwttoken)
  // create a jwt token containing the user id that expires in 15 minutes
  return jwt.sign({ sub: user.uuid, id: user.uuid }, process.env.jwttoken, {
    expiresIn: "15m",
  });
};

// generate refresh token
const generateRefreshToken = async (userId, ipAddress) => {
  // create a refresh token that expires in 7 days
  // const user = db.User.findOne({where:{
  //   id: userId
  // }})
  const refreshData = await db.RefreshToken.create({
    userId: userId,
    expires: JSON.stringify(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
    token: crypto.randomBytes(40).toString("hex"),
    createdByIP: ipAddress,
    isActive: true,
  });
  // console.log("refresHdata", refreshData);
  return refreshData;
};

const randomTokenString = async () => {
  return crypto.randomBytes(40).toString("hex");
};

const setTokenCookie = (res, token) => {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
};

// get basic details.
const basicDetails = (user) => {
  const {
    uuid,
    firstName,
    lastName,
    userName,
    email,
    role,
    emailVerified,
    verifiedContributor,
    jwtToken,
    refreshToken,
  } = user;
  return { uuid, firstName,userName, verifiedContributor,lastName, emailVerified,email, role, jwtToken, refreshToken };
};

const forgotPassword = async (email , origin) => {
  console.log("orgin",origin)
  const account = await db.User.findOne({ where: { email } });
  // always return ok response to prevent email enumeration
  if (!account) return;

  // create reset token that expires after 24 hours
  account.resetToken = (await randomTokenString()).toString();
  account.resetTokenExpires = (new Date(). getTime() + 24 * 60 * 60 * 1000);

  const update = await db.User.update(
    {
      resetToken: account.resetToken,
      resetTokenExpires: account.resetTokenExpires,
    },
    {
      where: { id: account.id },
    }
  );
  //console.log("update", account);
  // send email
  await sendPasswordResetEmail(account, origin);
};

async function validateResetToken({ token }) {
  try {
    let date = (new Date(). getTime());
  console.log("TOKEN :::",token)
  const account = await db.User.findOne({
    where: {
      resetToken: token
      // resetTokenExpires: { [Op.gt]: date },
    },
  });
  
  console.log('ACC :::',account)

  if (!account) throw "Invalid token";

  if(account.resetTokenExpires < date) throw "Token expired"
  
  return account;
  } catch (error) {
    next(error) 
  }
  
}
async function resetPassword({ token, password }) {
  try {
     const account = await validateResetToken({ token });

    // update password and remove reset token
    account.password = await bcrypt.hash(password, 10);;
    console.log("PASS:: ",account.password)
    account.passwordReset = Date.now();
    account.resetToken = null;
    account.save();
  } catch (error) {
    next(error) 

  }
 

}

async function sendPasswordResetEmail(account, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/reset-password?token=${account.resetToken}`;
    message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}"></a></p>`;
                   
                   //ya phely wala ha    <p><a href="${resetUrl}">${resetUrl}</a></p>`
    console.log("yes walla",message)
  } else {
    message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    console.log("No walla",message)               
  }
 
  await sendEmail({
    to: account.email,
    subject: "Enter the Sphere - Reset Password",
    html: `<h4>Reset Password Email</h4>
               ${message}`,
  });
}

const sendEmail = async ({ to, subject, html, from =config.emailFrom ,text = 'henlo' }) => {
  console.log("to::::: ",to);
  console.log("subject:::: ",subject);
  console.log("html:::: ",html);
  console.log("from:::: ",from);
  
  
  //console.log("test account ha ",testAccount);
  // create reusable transporter object using the default SMTP transport
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'domingo.hand98@ethereal.email',
//         pass: 'P8z7evNDxXjdEbPu2E'
//     }
// });
const transporter = nodemailer.createTransport({
  host: 'mail.coyodigital.com',
  port: 587,
  auth: {
      user: 'admin@coyodigital.com',
      pass: 'TfX$!X;AD23J'
  },
  secure: false, //disable SSL    
  requireTLS: true, //Force TLS
  tls: {
  rejectUnauthorized: false
}

});
transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const info =   await transporter.sendMail({ from, to, subject, html,text });
console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

return info

};

async function sendVerificationEmail(account, origin) {

  let message;
  if (origin) {
    const verifyUrl = `${origin}/verify-email?token=${account.verificationToken}&userId=${account.uuid}`;
    message = `<p>Please click the below link to verify your email address:</p>
                 <p><a href="${verifyUrl}">${verifyUrl}</aifyE></p>`;

    console.log("MEssageeee origin :::: ",message)
  } else {
    message = `<p>Please use the below token to verify your email address with the <code>/verify-email</code> api route:</p>
                 <p><code>${account.verificationToken}</code></p>`;

  }
  const info =  await sendEmail({
    to: account.email,
    subject: "Sign-up Verification API - Verify Email",
    html: `<h4>Verify Email</h4>
             <p>Thanks for registering!</p>
             ${message}`,
 });
 console.log("INFO FROM VERIFIVATION :: ",info)
 return info
}

async function verifyEmail( token,userId ) {
  console.log("USERId :::",userId)
  const account = await db.User.findOne({
    where: {[Op.and]:[{ uuid: userId },{verificationToken:token}]},
  });

  if (!account) {
  const err =  new Error("Verification failed");
  return false
  }

  account.verified = Date.now();
  account.emailVerified = true;
  await account.save();
  return jwt.sign({ sub: account.uuid, id: account.id }, process.env.jwttoken, {
    expiresIn: "15m",
  });


  

  
  //const update = await db.User.update(
  //   {
  //     verificationToken: account.verificationToken,
  //   },
  //   {
  //     where: {
  //       id: account.id,
  //     },
  //   }
  // );
}

module.exports = {
  authenticate,
  refreshToken,
  revokeToken,
  getAll,
  getById,
  getRefreshTokens,
  setTokenCookie,
  randomTokenString,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
