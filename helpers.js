// generate random 6 character string for shortURLs
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// return user if they exist
const getUserByEmail = (email, userDB) => {
  for (const user in userDB) {
    if (userDB[user].email === email) {
      return userDB[user];
    }
  }
};

//check if current logged in user is accessing their /urls/:shortURL
const isCurrentUser = (shortURL, userIDCookie, urlDB) => {
  return urlDB[shortURL].userID === userIDCookie;
};

// return URLs of the current logged in user
const urlsForUser = (userIDCookie, urlDB) => {
  let userURLs = {};
  for (let url in urlDB) {
    if (urlDB[url].userID === userIDCookie) {
      userURLs[url] = urlDB[url];
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  isCurrentUser,
  urlsForUser,
};
