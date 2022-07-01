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
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    userID: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    userID: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
// function takes in email and password and returns existing user details from {users} object if present, 
// returns "user not found if not"
function getUser(email, password) {
  for (let user in users) {
    console.log(users[user].userID, users[user].password)
    if (users[user].userID === email && users[user].password === password) {
      return users[user];
    }
  }
  return 'user not found';
}

// function creates a random 6 character string
function generateRandomString() {
  let randString = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%&*';
  for (let i = 0; i < 6; i++) {
    randString += char[Math.floor(Math.random() * char.length)];    
  }
  return randString;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userID = req.cookies.userID;
  const templateVars = { urls: urlDatabase, userID };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies.userID;
  res.render('urls_new', {userID});
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies.userID
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL] 

  const templateVars = { userID, shortURL, longURL };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {  
  const userID = req.cookies.userID;
  res.render('user_reg', {userID})
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// accepts a new url, creates a new key:value pair in the master URL object using the 
// random string generator
app.post('/urls', (req, res) => {
  const randString = generateRandomString();
  urlDatabase[randString] = "https://" + req.body.longURL;
  res.redirect(`/urls/${randString}`);
});

// overwrites (updates) an existing URL in the main key:value URL object
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  const userID = req.cookies.userID;
  const templateVars = { 
    userID,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };  
  res.render('urls_show', templateVars);
});  

// Deletes a selected key:value {miniLink:fullURL} from the main database 
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// verifies if user exists, logs in establishes a user cookie.
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUser(email, password);
  console.log(user, "found user");
  res.cookie('userID', user);
  res.redirect('/urls');
})

// logs user out and removes user cookie.
app.post('/logout', (req, res) => {
  const userID = req.body.userID;
  res.clearCookie('userID');
  res.redirect('/urls');
});

// accepts a new userID (email) and password, generates a random id and
// adds the new user details to the main user object 'database'. Ensures 
// no duplicate records are created for users with teh same email address,
// does not allow for empty fields during registration process.
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const userID = req.body.email;
  const password = req.body.password;
  users[userID] = { id, userID, password };
  if (userID === '' || password === '') {
    res.
  }

  res.cookie('userID', users[userID]);
  res.redirect('/urls');
});
