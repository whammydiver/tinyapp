// function takes in email and password and returns all existing user details from {users} object if present, 
// returns "user not found if not"
function getUserByEmail(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
}

// Checks if the user is creating a URL that already exists. 
function checkURL(longURL, urlDatabase, userID) {
  for (let url in urlDatabase) {
    if (urlDatabase[url].longURL === longURL && urlDatabase[url].id === userID) {
      return url;
    }
  }
  return false;
}

// function that loops through the full urlDatabase and returns only those urls created by the currently logged in user.
function urlsForUser(id, urlDatabase) {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].id === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

// function creates a random 6 character string
function generateRandomString() {
  let randString = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < 6; i++) {
    randString += char[Math.floor(Math.random() * char.length)];    
  }
  return randString;
}

module.exports = { getUserByEmail, checkURL, urlsForUser, generateRandomString };