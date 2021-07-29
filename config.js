require("dotenv").config();
/// old one
// const config = {
//   port: process.env.PORT,
//   sessionSecret: process.env.SESSION_SECRET,
//   jwtSecret: process.env.SECRET,
// };

const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  cashAddress: process.env.CASH_ADDRESS,
  slpAddress: process.env.SLP_ADDRESS,
  legacyAddress: process.env.LEGACY_ADDRESS,
  privateKey: process.env.PRIVATE_KEY,
  frontUrl: process.env.FRONT_URL,
  emailFrom: "Fred Foo 👻",
  smtpOptions: {
    host:
      "[ENTER YOUR OWN SMTP OPTIONS OR CREATE FREE TEST ACCOUNT IN ONE CLICK AT https://ethereal.email/]",
    port: 587,
    auth: {
      user: "",
      pass: "",
    },
  },
};






module.exports = config;
