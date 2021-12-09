const express = require("express");
const router = express.Router();
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  postLogout
} = require('../controllers/auth');


// show registration form; register new user
router.route("/register").get(getRegister).post(postRegister);

// show login form; log in user and set cookie
router.route("/login").get(getLogin).post(postLogin);

// clear cookie when user logs out
router.post("/logout", postLogout);

module.exports = router;
