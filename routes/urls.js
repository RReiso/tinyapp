const express = require("express");
const router = express.Router();
const {
  getURLs,
  getNewURL,
  postURLs,
  showURL,
  updateURL,
  deleteURL
} = require('../controllers/urls');


// show all URLs; save new URL
router.route("/").get(getURLs).post(postURLs);

// show new URL form
router.get("/new", getNewURL);

// show, update, delete URL
router.route("/:shortURL").get(showURL).put(updateURL).delete(deleteURL);

module.exports = router;
