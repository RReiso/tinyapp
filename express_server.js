const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;


// middleware
app.use(bodyParser.urlencoded({extended: true})); // read data from POST requests
app.use(cookieParser()); // parse cookie header, populate req.cookies with an object keyed by the cookie names

// use ejs as template ngine
app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  "b2xVn2":{longURL: "http://www.lighthouselabs.ca", dateCreated: "2021/12/04"},
  "9sm5xK":{longURL: "http://www.google.com", dateCreated: "2021/12/05"},
};

// generate random 6 character string for shortURLs
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

// ROUTES //
app.get("/", (req, res) => {
  res.send("Hello!");
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

// create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

// save new URL
app.post("/urls", (req, res) => {
  const today = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  urlDatabase[generateRandomString()] = {longURL: req.body.longURL, dateCreated: today};
  console.log(urlDatabase);
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
