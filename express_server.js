const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, checkURL, urlsForUser, generateRandomString } = require('./helperFunctions');

const app = express();
const PORT = 8080;

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['strongestkeyever']
}));

app.set('view engine', 'ejs');

let urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', id: 'aJ48lW' },
  '9sm5xK': { longURL: 'http://www.google.com', id: 'aJ48lW' },
  'omtDFB': { longURL: 'https://www.mortgagegroup.com', id: 'aJ48lW' },
  'CkQQoe': { longURL: 'https://www.hello.com', id: 'aJ48lW' },
  'IaYdqJ': { longURL: 'https://www.goodbye.com', id: 'aJ48lW' }
};

const users = {
  'aJ48lW': {
    id: 'aJ48lW',
    email: 'user@example.com',
    hashedPassword: '$2a$10$Twxp7AW2eZ7osV8.nmqlFOK9ZsvMOgRmlc0SCaVm2oiOAlcgTpOu.'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    hashedPassword: 'dishwasher-funk'
  },
};

// redirects / to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// returns a JSON display of the urlDatabase.
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Retrieves and displays the logged in user's created URLs.
app.get('/urls', (req, res) => {
  if (!req.session.userCookie) {
    res.redirect('/login');
  } else {
    const userCookie = req.session.userCookie;
    const userURLs = urlsForUser(userCookie.id, urlDatabase);
    const templateVars = { urls: userURLs, userCookie };
    res.render('urls_index', templateVars);
  }
});

// Permits logged in users to create new url short versions.
app.get('/urls/new', (req, res) => {
  const userCookie = req.session.userCookie;
  if (!userCookie) {
    res.redirect('/login');
  } else {
    res.render('urls_new', {userCookie});
  }
});

// Displays details of a single URL. The generated 'urls_show' page includes
// the optional functionality to edit the long form URL.
app.get('/urls/:shortURL', (req, res) => {
  const userCookie = req.session.userCookie;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  
  const templateVars = { userCookie, shortURL, longURL };
  res.render('urls_show', templateVars);
});

// Renders the login page.
app.get('/login', (req, res) => {
  const userCookie = req.session.userCookie;
  if (userCookie) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', {userCookie});
  }
});

// Renders the new user registration page.
app.get('/register', (req, res) => {
  const userCookie = req.session.userCookie;
  if (userCookie) {
    res.redirect('/urls');
  } else {
    res.render('user_reg', {userCookie});
  }
});

// Permits creators of the short urls to use them with this abbreviated url format: (/u/:shortURL)
// Attempts to visit these url shortforms by anyoe but their owner/creator will throw an error.
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send('404 - tinyURL does not exist');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
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
  if (!email || !password) {
    res.send('Error 400: username and password must contain values');
  } else if (getUserByEmail(email, users)) {
    res.send('400 - email aleady exists. Please login');
  } else {
    users[id] = { id, email, hashedPassword };
    req.session.userCookie = users[id];
    res.redirect('/urls');
  }
});

// verifies if user exists, checks email and password match. If so,
// logs user in and establishes a user cookie.
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email || !password) {
    res.send('Error 400: username and password must contain values');
  } else if (!user) {
    res.send('403 - user not found');
  } else if (bcrypt.compareSync(password, user.hashedPassword)) {
    req.session.userCookie = user;
    res.redirect('/urls');
  } else {
    res.send('403 - password does not match. Try again.');
  }
});

// logs user out and removes user cookie.
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// accepts a new url, validates that it doesn't exist in this user's url records, and creates
// a new key:value pair in the master URL object using the random string generator. If url
// already exists in the database for the logged in user, redirects to the edit page with existing
// record details displayed. (ensures no record duplication at the user level)
app.post('/urls', (req, res) => {
  const userCookie = req.session.userCookie;
  if (!userCookie) {
    res.redirect('/login');
  }
  if (req.body.longURL === "") {
    res.send('Error - URL cannot be empty');
  } else {
    let existingURL = checkURL(req.body.longURL, urlDatabase, userCookie.id);
    if (existingURL === false) {
      const randString = generateRandomString();
      urlDatabase[randString] = { longURL: req.body.longURL, id: userCookie.id };
      res.redirect(`/urls/${randString}`);
    } else {
      const userCookie = req.session.userCookie;
      const shortURL = existingURL;
      const longURL = urlDatabase[existingURL].longURL;
      const templateVars = { userCookie, shortURL, longURL };
      res.render('urls_show', templateVars);
    }
  }
});

// Overwrites (updates) an existing URL in the main key:value URL object
// Only the creator of the shortURL can update.
app.patch('/urls/:shortURL/edit', (req, res) => {
  const userCookie = req.session.userCookie;
  if (!userCookie) {
    res.redirect('/login');
  }
  if (req.body.longURL === "") {
    res.send('Error - URL cannot be empty');
  } else if (urlDatabase[req.params.shortURL].id === req.session.userCookie.id) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, id: userCookie.id };
    const templateVars = {
      userCookie,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('Error - user not authorised');
  }
});

// Allows the creator of a selected key:value {miniLink:fullURL} to delete the record from the main database.
app.delete('/urls/:shortURL/delete', (req, res) => {
  const userCookie = req.session.userCookie;
  if (!userCookie) {
    res.send('Error - user not authorised');
  } else if (urlDatabase[req.params.shortURL].id === req.session.userCookie.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('Error - user not authorised');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});