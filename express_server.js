const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
let { users } = require("./db/users");
let { urlDatabase } = require("./db/urlDatabase");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs"); // use ejs as template ngine

//// --- MIDDLEWARE --- ///
app.use(bodyParser.urlencoded({extended: true})); // read data from POST requests
app.use(cookieParser()); // parse cookie header, populate req.cookies with an object keyed by the cookie names


//// --- HELPER FUNCTIONS --- ///
// generate random 6 character string for shortURLs
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

// return user object if it exists
const userInDatabase = (email) =>{
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};


/// --- ROUTES --- ///
app.get("/", (req, res) => {
  res.send("Hello!");
});

// show registration form
app.get("/register", (req, res) => {
  const { user_id } = req.cookies;

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
    res.sendStatus(404);
    return;
  }

  // display error message if user passes empty strings
  if (email.includes(" ") || password.includes(" ")) {
    templateVars.error = {message: "Email/password cannot include empty spaces!"};
    res.render("register",templateVars);
    return;
  }

  // re-render 'register' and show error if email already exists
  if (userInDatabase(email)) {
    templateVars.error = {message: "Email already registered!"};
    res.render("register",templateVars);
    return;
  }

  // add new user to database and set cookie
  users[id] = {id, email, password};
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// show login form
app.get("/login", (req, res) => {
  const { user_id } = req.cookies;

  // if user is logged in, redirect
  if (user_id) {
    res.redirect("urls");
    return;
  }

  const templateVars = {
    error: false,
    user: false
  };

  for (const user in users) {
    if (users[user].id === user_id) {
      templateVars.user = users[user];
    }
  }
  res.render("login", templateVars);
});

// log in user and set cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const currentUser = userInDatabase(email);

  //send 403 if user does not exist || wrong password
  if (!currentUser || password !== currentUser.password) {
    res.sendStatus(403);
    return;
  }

  res.cookie("user_id", currentUser.id); // set cookie
  res.redirect("/urls");
});

// clear cookie when user logs out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// show all URLs from database
app.get("/urls", (req, res) => {
  const templateVars = {
    error: false,
    user: false,
    urls: urlDatabase
  };
  const { user_id } = req.cookies;
  for (let user in users) {
    if (users[user].id === user_id) {
      templateVars.user = users[user];
    }
  }
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
  const { user_id } = req.cookies;

  if (!user_id) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    error: false,
    user: false,
    urls: urlDatabase
  };

  for (let user in users) {
    if (users[user].id === user_id) {
      templateVars.user = users[user];
    }
  }
  res.render("urls_new", templateVars);
});

// create new URL
app.post("/urls", (req, res) => {
  const { user_id } = req.cookies;

  // stop not logged in users from creating url
  if (!user_id) {
    res.send(403);
    return;
  }

  const today = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  urlDatabase[generateRandomString()] = {longURL: req.body.longURL, dateCreated: today};
  res.redirect("/urls");
});

// show URL
app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = urlDatabase[shortURL];
  const templateVars = {
    error: false,
    user: false,
    longURL,
    shortURL
  };
  const { user_id } = req.cookies;
  for (let user in users) {
    if (users[user].id === user_id) {
      templateVars.user = users[user];
    }
  }
  res.render("urls_show", templateVars);
});

//update URL
app.post("/urls/:shortURL", (req, res) => {
  const { user_id } = req.cookies;

  // stop not logged in users from updating url
  if (!user_id) {
    res.send(403);
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
  urlDatabase[shortURL] = { longURL, dateCreated };
  res.redirect("/urls");
});

// delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const { user_id } = req.cookies;

  // stop not logged in users from deleting url
  if (!user_id) {
    res.send(403);
    return;
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("*", (req, res) => {
  const { user_id } = req.cookies;

  // if user is logged in, redirect
  if (user_id) {
    res.redirect("urls");
    return;
  }
  res.sendStatus(404);
});

// listen for incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
