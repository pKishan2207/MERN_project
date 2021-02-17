require("dotenv").config();
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const ejwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "Not able to save user in DB",
        message: err.errmsg,
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
    });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User email does no exist",
        message: err,
      });
    }
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email or Password is incorrect",
        message: err,
      });
    }
    //create Token
    const authToken = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token to cookie
    res.cookie("token", authToken, { expire: new Date() + 999 });
    //send response to front end
    const { _id, name, email, role } = user;
    return res
      .status(200)
      .json({ authToken, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User Signout Successfully",
  });
};

// protected routes
exports.isSignedIn = ejwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});

// custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(401).json({
      error: "You do not have admin rights!",
    });
  }
  next();
};
