const getHomePage = (req, res) => {
  const { user_id } = req.session;
  res.redirect("urls");
};

module.exports = {
  getHomePage
};

