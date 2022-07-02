const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const res = require('express/lib/response');
const { getUserByEmail, checkURL, urlsForUser, generateRandomString } = require('./helperFunctions');
const { redirect } = require('express/lib/response');
const req = require('express/lib/request');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["strongestkeyever"]
}));

let urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'eS*EY2' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'Gc4QXM' },
  '7!hZd$': { longURL: 'https://www.unisonsoftware.ca', userID: 'eS*EY2' },
  '$mtDFB': { longURL: 'https://www.mortgagegroup.com', userID: 'eS*EY2' },
  'CkQQoe': { longURL: 'https://www.hello.com', userID: 'Gc4QXM' },
  'IaYdqJ': { longURL: 'https://www.goodbye.com', userID: 'Gc4QXM' }
};

const users = { 
  'Gc4QXM' : {
    id: 'Gc4QXM', 
    userID: 'taylorpaulian@gmail.com', 
    hashedPassword: '$2a$10$YW.b74sUBVk6lguRVQzbhuz6g./CddSbM8MGEJbddf6gcKENa9Lgy'
  },
  'eS*EY2': { 
    id: 'eS*EY2', 
    userID: 'paul@whammydiver.ca', 
    hashedPassword: '$2a$10$O8FvsEyHQI3MqqbvHw1oy.BWbKG9iFI5m1qD1rxDZvOsuis3qQnmy' 
  }
};

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
  console.log(req.session.id)
  if (!req.session.userID) {
    res.redirect('/login');
  } else {
    const userID = req.session.userID;
    console.log(userID);
    const userURLs = urlsForUser(userID.id, urlDatabase);
    console.log('userURLs = ', userURLs);
    const templateVars = { urls: userURLs, userID };
    res.render('urls_index', templateVars);
  }
});

// create new requires user to be logged in. new urls records include the userID of the creator.
app.get('/urls/new', (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.render('urls_login', {userID});
  } else {
    res.render('urls_new', {userID});
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL; 

  const templateVars = { userID, shortURL, longURL };
  res.render('urls_show', templateVars);
});

app.get('/login', (req, res) => {  
  const userID = req.session.userID;
  res.render('urls_login', {userID})
})

app.get('/register', (req, res) => {  
  const userID = req.session.userID;
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
  const userID = req.session.userID.id;
  existingURL = checkURL("https://" + req.body.longURL, urlDatabase);
  if (existingURL === false) {
    const randString = generateRandomString();
    urlDatabase[randString] = { longURL: req.body.longURL, userID }
    console.log(urlDatabase);
    res.redirect(`/urls/${randString}`);
  } else {
    const userID = req.session.userID;
    const shortURL = existingURL;
    const longURL = urlDatabase[existingURL].longURL; 
    console.log(urlDatabase);
    const templateVars = { userID, shortURL, longURL }
    res.render('urls_show', templateVars);
  }
});

// overwrites (updates) an existing URL in the main key:value URL object
app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.session.userID;
  if (urlDatabase[req.params.shortURL].userID === req.session.userID.id) {
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
  const userID = req.session.userID;
  if (!userID) {
    res.send('Error - user not authorised');
  } else if (urlDatabase[req.params.shortURL].userID === req.session.userID.id) {
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
  const user = getUserByEmail(email, users);
  if (email === '' || password === '') {
    res.send("Error 400: username and password must contain values");
  }
  if (!user) {
    res.send('403 - user not found');
  } else if (bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.userID = user;
      res.redirect('/urls');
  } else {
      res.send('403 - password does not match. Try again.')
  }
})

// logs user out and removes user cookie.
app.post('/logout', (req, res) => {
  const userID = req.body.userID;
  req.session.userID = null;
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (userID === '' || password === '') {
    res.send("Error 400: username and password must contain values");
  }
  if (getUserByEmail(userID)) {
    res.send('400 - email aleady exists. Please login')
  } else {
    users[id] = { id, userID, hashedPassword };
    req.session.userID = users[id];
    res.redirect('/urls');
  }
});
