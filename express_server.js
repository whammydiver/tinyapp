const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');
const req = require('express/lib/request');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: "aJ48lW" },
  '9sm5xK': { longURL: 'http://www.google.com', userID: "aJ48lW" },
  '7!hZd$': { longURL: 'https://www.unisonsoftware.ca', userID: 'eS*EY2' },
  '$mtDFB': { longURL: 'https://www.mortgagegroup.com', userID: 'eS*EY2' },
  'CkQQoe': { longURL: 'https://www.hello.com', userID: 'Gc4QXM' },
  'IaYdqJ': { longURL: 'https://www.goodbye.com', userID: 'Gc4QXM' }
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    userID: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    userID: "user2@example.com", 
    password: "dishwasher-funk"
  },
  'Gc4QXM' : {
    id: 'Gc4QXM', 
    userID: 'taylorpaulian@gmail.com', 
    password: 'scouse'
  },
  'eS*EY2': { 
    id: 'eS*EY2', 
    userID: 'paul@whammydiver.ca', 
    password: 'scouse' }
};
// function takes in email and password and returns all existing user details from {users} object if present, 
// returns "user not found if not"
function getUser(email, password) {
  for (let user in users) {
    if (users[user].userID === email && users[user].password === password) {
      return users[user];
    }
  }
  return null;
}

function checkEmail(email) {
  for(let user in users) {
    if (users[user].userID === email) {
      return true;
    }
  }
  return false;
}

function checkURL(longURL) {
  for (let url in urlDatabase) {
    if (urlDatabase[url].longURL === longURL) {
      return url;
    }
  }
  return false;
}


// function that loops through the full urlDatabase and returns only those urls created by the currently logged in user.
function urlsForUser(id) {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

// function creates a random 6 character string
function generateRandomString() {
  let randString = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#*';
  for (let i = 0; i < 6; i++) {
    randString += char[Math.floor(Math.random() * char.length)];    
  }
  return randString;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// redirects / to homepage
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  if (!req.cookies.userID) {
    res.redirect('/login');
  } else {
    const userID = req.cookies.userID;
    console.log(userID);
    const userURLs = urlsForUser(userID.id);
    console.log('userURLs = ', userURLs);
    const templateVars = { urls: userURLs, userID };
    res.render('urls_index', templateVars);
  }
});

// create new requires user to be logged in. new urls records include the userID of the creator.
app.get('/urls/new', (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    res.render('urls_login', {userID});
  } else {
    res.render('urls_new', {userID});
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies.userID;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL; 

  const templateVars = { userID, shortURL, longURL };
  res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {  
  const userID = req.cookies.userID;
  res.render('urls_login', {userID})
})

app.get('/register', (req, res) => {  
  const userID = req.cookies.userID;
  res.render('user_reg', {userID})
})

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send('404 - tinyURL does not exist');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// accepts a new url, creates a new key:value pair in the master URL object using the 
// random string generator
app.post('/urls', (req, res) => {
  const userID = req.cookies.userID.id;
  existingURL = checkURL("https://" + req.body.longURL);
  if (existingURL === false) {
    const randString = generateRandomString();
    urlDatabase[randString] = { longURL: "https://" + req.body.longURL, userID }
    console.log(urlDatabase);
    res.redirect(`/urls/${randString}`);
  } else {
    const userID = req.cookies.userID;
    const shortURL = existingURL;
    const longURL = urlDatabase[existingURL].longURL; 
  
    const templateVars = { userID, shortURL, longURL }
    res.render('urls_show', templateVars);
  }
});

// overwrites (updates) an existing URL in the main key:value URL object
app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.cookies.userID;
  if (urlDatabase[req.params.shortURL].userID === req.cookies.userID.id) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: userID.id }
    const templateVars = { 
      userID,
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL 
    }
    res.render('urls_show', templateVars);
    } else {
      res.send('Error - user not authorised');
    }
});  

// Deletes a selected key:value {miniLink:fullURL} from the main database
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies.userID;
  if (!userID) {
    res.send('Error - user not authorised');
  } else if (urlDatabase[req.params.shortURL].userID === req.cookies.userID.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('Error - user not authorised');
  }
});

// verifies if user exists, checks email and password  match. If so, 
// logs user in and establishes a user cookie.
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUser(email, password);
  if (user === null && checkEmail(email) === false) {
    res.send('403 - user not found');
  } else if (user === null && checkEmail(email) === true) {
    res.send('403 - password does not match. Try again.')
  } else {
    res.cookie('userID', user);
    res.redirect('/urls');
  }
})

// logs user out and removes user cookie.
app.post('/logout', (req, res) => {
  const userID = req.body.userID;
  res.clearCookie('userID');
  res.redirect('/login');
});

// accepts a new userID (email) and password, generates a random id and
// adds the new user details to the main user object 'database'. Ensures 
// no duplicate records are created for users with the same email address,
// does not allow for empty fields during registration process.
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const userID = req.body.email;
  const password = req.body.password;
  if (userID === '' || password === '') {
    res.send("Error 400: username and password must contain values");
  }
  if (checkEmail(userID) === true) {
    res.send('400 - email aleady exists. Please login')
  } else {
    users[id] = { id, userID, password };
    res.cookie('userID', users[id]);
    res.redirect('/urls');
  }
});
