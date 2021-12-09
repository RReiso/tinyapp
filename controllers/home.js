const getHomePage = (req, res) => {
  const { user_id } = req.session;

  // if user is logged in, redirect
  if (user_id) {
    res.redirect("urls");
    return;
  }
  res.redirect("/login");
};

module.exports = {
  getHomePage
};

