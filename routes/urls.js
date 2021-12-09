const express = require("express");
const router = express.Router();
let { users } = require("../db/users");
let { urlDatabase } = require("../db/urlDatabase");
const {
  generateRandomString,
  getUserByCookie,
  isCurrentUser,
  urlsForUser
} = require('../helpers');

// show all URLs from database
router.get("/", (req, res) => {
  const { user_id } = req.session;
  const templateVars = {
    error: false,
    user: getUserByCookie(user_id, users),
    urls: urlsForUser(user_id, urlDatabase)
  };

  res.render("urls_index", templateVars);
});

// show new URL form
router.get("/new", (req, res) => {
  const { user_id } = req.session;

  // redirect if user not logged in
  if (!user_id) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    error: false,
    user: getUserByCookie(user_id, users),
  };

  res.render("urls_new", templateVars);
});

// create new URL
router.post("/", (req, res) => {
  const { user_id } = req.session;

  // stop not logged in users from creating url
  if (!user_id) {
    res.status(403).send("Only logged in users can create URLs!");
    return;
  }

  const { longURL } = req.body;
  const dateCreated = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  urlDatabase[generateRandomString()] = {longURL, dateCreated, timesVisited: 0, userID: user_id};

  res.redirect("/urls");
});

// show URL
router.get("/:shortURL", (req, res) => {
  const { user_id } = req.session;
  const { shortURL } = req.params;
  const  url  = urlDatabase[shortURL];

  // redirect if user is not logged in
  if (!user_id) {
    res.status(403).send("Must be logged in!");
    return;
  }

  // send 403 status if user tries to view URL of another user
  if (!isCurrentUser(shortURL, user_id, urlDatabase)) {
    res.status(403).send("Can't view URL of another user!");
    return;
  }
 
  const templateVars = {
    error: false,
    user: getUserByCookie(user_id, users),
    url,
    shortURL
  };

  res.render("urls_show", templateVars);
});

//update URL
router.put("/:shortURL", (req, res) => {
  const { user_id } = req.session;

  // stop not logged in users from updating url
  if (!user_id) {
    res.status(403).send("Only logged in users can update URLs!");
    return;
  }

  const { shortURL } = req.params;
  const { longURL } = req.body;
  const dateCreated = new Date().toJSON().slice(0,10).replace(/-/g,'/');

  // re-render page with error message if empty string passed
  if (longURL.trim() === "") {
    const templateVars = {
      error: {message: "URL cannot be empty"},
      user: false,
      longURL,
      shortURL
    };

    res.render("urls_show",templateVars);
    return;
  }
  
  // save new URL
  urlDatabase[shortURL] = { longURL, dateCreated, timesVisited: 0, userID: user_id };
  res.redirect("/urls");
});

// delete URL
router.delete("/:shortURL", (req, res) => {
  const { user_id } = req.session;
  const { shortURL } = req.params;

  // stop not logged in users from deleting url
  if (!user_id) {
    res.status(403).send("Only logged in users can delete URLs!");
    return;
  }
  
  if (!isCurrentUser(shortURL, user_id, urlDatabase)) {
    res.status(403).send("Wrong user!");
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

module.exports = router;
