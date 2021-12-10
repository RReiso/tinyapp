const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
let { urlDatabase } = require("./db/urlDatabase");
const urlsRouter = require("./routes/urls");
const authRouter = require("./routes/auth");
const homeRouter = require("./routes/home");

const app = express();
const port = 8080;

app.set("view engine", "ejs"); // use ejs as template ngine

//// --- MIDDLEWARE --- ///
app.use(bodyParser.urlencoded({extended: true})); // read data from POST requests
app.use(cookieSession({name: 'session', keys:["veryImportantKey1", "veryImportantKey2"]}));
app.use(methodOverride('_method'));
app.use("/urls", urlsRouter);
app.use("/", homeRouter);
app.use("/", authRouter);


/// --- ROUTES --- ///
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

// all 404 routes
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
app.listen(process.env.PORT || port, () => {
  console.log(`TinyApp listening on port ${port}!`);
});
