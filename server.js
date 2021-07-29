const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const errorHandler = require("./src/middleware/errorHandler");
const logger = require("morgan");
const passport = require("passport");
//const passportConfig = require("./passport-config");
const sessions = require("express-session");
const db = require("./models");
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");


const { sequelize } = require("./models");
const cors = require("cors");
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(cookie());


app.use(
  sessions({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => res.json({ msg: "Welcome to Lawyers api" }));

app.use("/lawyer", require("./src/routes/lawyer-route"));
app.use("/client", require("./src/routes/client-route"));
app.use("/common", require("./src/routes/common-route"));

//app.use(express.static(path.join(__dirname, "../public")));
app.use(errorHandler)

app.use((req, res, next) => {
  const err = new Error("Not found!");
  err.status = 404;
  return res.status(404).json({
    error: "API not found ",
  });
  next(err);
});


app.listen("7000", async () => {
  console.log("Server Start");
  console.log(`http://localhost:7000`);
  await sequelize.authenticate();
  //await sequelize.sync({force:true , alter: true});
  console.log("DB connected");
});
