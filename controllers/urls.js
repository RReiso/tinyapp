let { users } = require("../db/users");
let { urlDatabase } = require("../db/urlDatabase");
const {
  generateRandomString,
  isCurrentUser,
  urlsForUser,
} = require("../helpers");

const getURLs = (req, res) => {
  const { user_id } = req.session;
  const templateVars = {
    user: users[user_id],
    urls: urlsForUser(user_id, urlDatabase),
  };
  res.render("urls_index", templateVars);
};

const getNewURL = (req, res) => {
  const { user_id } = req.session;

  // redirect if user not logged in
  if (!user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", { user: users[user_id] });
};

const postURLs = (req, res) => {
  const { user_id } = req.session;

  // stop not logged in users from creating url
  if (!user_id) {
    res.status(403).send("Only logged in users can create URLs!");
    return;
  }

  let { longURL } = req.body;
  if (longURL.trim() === "") {
    res.status(400).send("URL cannot be empty!");
    return;
  }
  if (!longURL.includes("http")) {
    longURL = "https://" + longURL;
  }

  const dateCreated = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
  urlDatabase[generateRandomString()] = {
    longURL,
    dateCreated,
    timesVisited: 0,
    userID: user_id,
  };

  res.redirect("/urls");
};

const showURL = (req, res) => {
  const { user_id } = req.session;
  const { shortURL } = req.params;
  const url = urlDatabase[shortURL];

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
    user: users[user_id],
    url,
    shortURL,
  };

  res.render("urls_show", templateVars);
};

const updateURL = (req, res) => {
  const { user_id } = req.session;

  // stop not logged in users from updating url
  if (!user_id) {
    res.status(403).send("Only logged in users can update URLs!");
    return;
  }

  const { shortURL } = req.params;
  let { longURL } = req.body;
  const dateCreated = new Date().toJSON().slice(0, 10).replace(/-/g, "/");

  // re-render page with error message if empty string passed
  if (longURL.trim() === "") {
    res.status(400).send("URL cannot be empty!");
    return;
  }

  if (!longURL.includes("http")) {
    longURL = "https://" + longURL;
  }

  // save new URL
  urlDatabase[shortURL] = {
    longURL,
    dateCreated,
    timesVisited: 0,
    userID: user_id,
  };
  res.redirect("/urls");
};

const deleteURL = (req, res) => {
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
};

module.exports = {
  getURLs,
  getNewURL,
  postURLs,
  showURL,
  updateURL,
  deleteURL,
};
