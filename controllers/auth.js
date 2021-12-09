const bcrypt = require('bcryptjs');
let { users } = require("../db/users");
const { generateRandomString, getUserByEmail } = require('../helpers');

const getRegister = (req, res) => {
  const { user_id } = req.session;

  // if user is logged in, redirect
  if (user_id) {
    res.redirect("urls");
    return;
  }
  const templateVars = {
    error: false,
    user: false
  };

  res.render("register", templateVars);
};

const postRegister = (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  const templateVars = {
    error: false,
    user: false
  };

  // send 404 if email/password not provided
  if (email === "" || password === "") {
    res.status(404).send("Email and password cannot be empty!");
    return;
  }

  // display error message if user passes empty strings
  if (email.includes(" ") || password.includes(" ")) {
    templateVars.error = {message: "Email/password cannot include empty spaces!"};
    res.render("register",templateVars);
    return;
  }

  // re-render 'register' and show error if email already exists
  if (getUserByEmail(email, users)) {
    templateVars.error = {message: "Email already registered!"};
    res.render("register",templateVars);
    return;
  }

  // add new user to database and set cookie
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {id, email, password: hashedPassword};
  req.session.user_id = id;
  res.redirect("/urls");
};

const getLogin = (req, res) => {
  const { user_id } = req.session;

  // if user is logged in, redirect
  if (user_id) {
    res.redirect("urls");
    return;
  }

  const templateVars = {
    error: false,
    user: false
  };

  res.render("login", templateVars);
};

const postLogin = (req, res) => {
  const { email, password } = req.body;
  const existingUser = getUserByEmail(email, users);

  //send 403 if user does not exist || wrong password
  if (!existingUser) {
    res.status(403).send("User does not exist or wrong email/password combination!");
    return;
  }
  const isPasswordsMatch = bcrypt.compareSync(password, existingUser.password);
  if (!isPasswordsMatch) {
    res.status(403).send("User does not exist or wrong email/password combination!");
    return;
  }

  req.session.user_id = existingUser.id; // set cookie
  res.redirect("/urls");
};

const postLogout = (req, res) => {
  req.session = null;
  res.redirect("/urls");
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  postLogout
};
