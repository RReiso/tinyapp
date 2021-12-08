const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
let { users } = require("./db/users");
let { urlDatabase } = require("./db/urlDatabase");
const app = express();
const PORT = 8080;


// middleware
app.use(bodyParser.urlencoded({extended: true})); // read data from POST requests
app.use(cookieParser()); // parse cookie header, populate req.cookies with an object keyed by the cookie names

// use ejs as template ngine
app.set("view engine", "ejs");

// generate random 6 character string for shortURLs
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

// ROUTES //
app.get("/", (req, res) => {
  res.send("Hello!");
});

// show registration form
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    error: false
  };
  res.render("register", templateVars);
});

// register new user
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  for (const user in users) {
    if (users[user].email === email) {
      const templateVars = {
        username: req.cookies.username,
        error: {message: "Email already registered!"}
      };
      res.render("register",templateVars);
      return;
    }
  }
  users[id] = {id, email, password};
  console.log(users);
  res.redirect("/urls");
});

// set cookie when user logs in
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

// clear cookie when user logs out
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// show all URLs from database
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

// retrieve longURL from database and redirect to it
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const { longURL } = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send("URL does not exist");
  }
});

// show new URL form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

// create new URL
app.post("/urls", (req, res) => {
  const today = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  urlDatabase[generateRandomString()] = {longURL: req.body.longURL, dateCreated: today};
  res.redirect("/urls");
});

// show URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

//update URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const today = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  urlDatabase[shortURL] = {longURL: req.body.longURL, dateCreated: today};
  res.redirect("/urls");
});

// delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// listen for incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
