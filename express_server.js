const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const res = require('express/lib/response');
const req = require('express/lib/request');
const { redirect } = require('express/lib/response');
const bcrypt = require('bcryptjs');
const { getUserByEmail, checkURL, urlsForUser, generateRandomString } = require('./helperFunctions');

const app = express();
const PORT = 8080;

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["strongestkeyever"]
}));

app.set('view engine', 'ejs');

let urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'aJ48lW' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'aJ48lW' },
  '$mtDFB': { longURL: 'https://www.mortgagegroup.com', userID: 'aJ48lW' },
  'CkQQoe': { longURL: 'https://www.hello.com', userID: 'aJ48lW' },
  'IaYdqJ': { longURL: 'https://www.goodbye.com', userID: 'aJ48lW' }
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    hashedPassword: '$2a$10$Twxp7AW2eZ7osV8.nmqlFOK9ZsvMOgRmlc0SCaVm2oiOAlcgTpOu.'
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: "dishwasher-funk"
  },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// redirects / to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  if (!req.session.userID) {
    res.redirect('/login');
  } else {
    const userID = req.session.userID;
    const userURLs = urlsForUser(userID.id, urlDatabase);
    const templateVars = { urls: userURLs, userID };
    res.render('urls_index', templateVars);
  }
});

// create new requires user to be logged in. new url records include the userID of the creator.
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

// accepts a new url, validates that it doesn't exist, and creates a new key:value pair in the 
// master URL object using the random string generator. If url already exists in the database
// for the logged in user, redirects to the edit page with existing record details displayed. 
// (ensures no record duplication)
app.post('/urls', (req, res) => {
  const userID = req.session.userID.id;
  existingURL = checkURL("https://" + req.body.longURL, urlDatabase);
  if (existingURL === false) {
    const randString = generateRandomString();
    urlDatabase[randString] = { longURL: req.body.longURL, userID }
    res.redirect(`/urls/${randString}`);
  } else {
    const userID = req.session.userID;
    const shortURL = existingURL;
    const longURL = urlDatabase[existingURL].longURL; 
    const templateVars = { userID, shortURL, longURL }
    res.render('urls_show', templateVars);
  }
});

// overwrites (updates) an existing URL in the main key:value URL object
app.patch('/urls/:shortURL/edit', (req, res) => {
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
app.delete('/urls/:shortURL/delete', (req, res) => {
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

// verifies if user exists, checks email and password match. If so, 
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

// accepts a new email and password, generates a random id and
// adds the new user details to the main user object 'database'. Ensures 
// no duplicate records are created for users with the same email address,
// does not allow for empty fields during registration process.
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.send("Error 400: username and password must contain values");
  }
  if (getUserByEmail(email, users)) {
    res.send('400 - email aleady exists. Please login')
  } else {
    users[id] = { id, email, hashedPassword };
    req.session.userID = users[id];
    res.redirect('/urls');
  }
});
