const db = require("../../models");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authenticate = async ({ id, password, ipAddress }) => {
  const user = await db.User.findOne({
    where: {
      id,
    },
  });
  console.log("ad", user);
  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(user);
  const refreshToken = await generateRefreshToken(user, ipAddress);
  console.log("refresh", refreshToken);
  // return basic details and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: refreshToken.token,
  };
};

const refreshToken = async ({ token, ipAddress }) => {
  const refreshToken = await getRefreshToken(token);
  const { user } = refreshToken;

  // replace old refresh token with a new one and save
  const newRefreshToken = await generateRefreshToken(user, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;

  await db.RefreshToken.create(refreshToken);

  // generate new jwt
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

  await db.RefreshToken.update({});
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
  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
};

// generate new jwt token
generateJwtToken = (user) => {
  // create a jwt token containing the user id that expires in 15 minutes
  return jwt.sign({ sub: user.id, id: user.id }, config.jwtSecret, {
    expiresIn: "15m",
  });
};

// generate refresh token
const generateRefreshToken = async (user, ipAddress) => {
  // create a refresh token that expires in 7 days
  const refreshData = await db.RefreshToken.create({
    userId: user.id,
    expires: JSON.stringify(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    token: crypto.randomBytes(40).toString("hex"),
    createdByIP: ipAddress,
  });
  console.log("refresHdata", refreshData);
  return refreshData;
};

const randomTokenString = async () => {
  return crypto.randomBytes(40).toString("hex");
};

const setTokenCookie = (res, token) => {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
};

// get basic details.
const basicDetails = (user) => {
  const { id, firstName, lastName, email, role, jwtToken, refreshToken } = user;
  return { id, firstName, lastName, email, role, jwtToken, refreshToken };
};

const forgotPassword = async ({ email }, origin) => {
  const account = await db.User.findOne({ where: { email } });

  // always return ok response to prevent email enumeration
  if (!account) return;

  // create reset token that expires after 24 hours
  account.resetToken = randomTokenString();
  account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await account.save();

  // send email
  await sendPasswordResetEmail(account, origin);
};

async function validateResetToken({ token }) {
  const account = await db.Account.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!account) throw "Invalid token";

  return account;
}
async function resetPassword({ token, password }) {
  const account = await validateResetToken({ token });

  // update password and remove reset token
  account.passwordHash = await hash(password);
  account.passwordReset = Date.now();
  account.resetToken = null;
  await account.save();
}

async function sendPasswordResetEmail(account, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
    message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
  }

  await sendEmail({
    to: account.email,
    subject: "Enter the Sphere - Reset Password",
    html: `<h4>Reset Password Email</h4>
               ${message}`,
  });
}
const sendEmail = async ({ to, subject, html, from = config.emailFrom }) => {
  const transporter = nodemailer.createTransport(config.smtpOptions);
  await transporter.sendMail({ from, to, subject, html });
};
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
};
