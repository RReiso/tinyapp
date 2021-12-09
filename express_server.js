const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
let { users } = require("./db/users");
let { urlDatabase } = require("./db/urlDatabase");
const urlsRouter = require("./routes/urls");
const { generateRandomString, getUserByEmail } = require('./helpers');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs"); // use ejs as template ngine

//// --- MIDDLEWARE --- ///
app.use(bodyParser.urlencoded({extended: true})); // read data from POST requests
app.use(cookieSession({name: 'session', keys:["veryImportantKey1", "veryImportantKey2"]}));
app.use(methodOverride('_method'));
app.use("/urls", urlsRouter);

/// --- ROUTES --- ///
app.get("/", (req, res) => {
  const { user_id } = req.session;

  // if user is logged in, redirect
  if (user_id) {
    res.redirect("urls");
    return;
  }
  res.redirect("/login");
});

// show registration form
app.get("/register", (req, res) => {
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
});

// register new user
app.post("/register", (req, res) => {
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
});

// show login form
app.get("/login", (req, res) => {
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
});

// log in user and set cookie
app.post("/login", (req, res) => {
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
});

// clear cookie when user logs out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// retrieve longURL from database and redirect to it
app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL].timesVisited++;
    const { longURL } = urlDatabase[shortURL];
    res.redirect(longURL);
    return;
  } else {
    res.send("URL does not exist");
  }
});

app.get("*", (req, res) => {
  const { user_id } = req.session;

  // if user is logged in, redirect
  if (user_id) {
    res.redirect("/urls");
    return;
  }
  res.status(404).send("Page does not exist!");
});

// listen for incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
