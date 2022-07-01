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
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  let randString = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()[]{}';
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
  const email = req.cookies.email;
  const templateVars = { urls: urlDatabase, email };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const email = req.cookies.email;
  res.render('urls_new', {email});
});

app.get('/urls/:shortURL', (req, res) => {
  const email = req.cookies.email
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL] 

  const templateVars = { email, shortURL, longURL };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {  
  const email = req.cookies.email;
  res.render('user_reg', {email})
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const randString = generateRandomString();
  urlDatabase[randString] = "https://" + req.body.longURL;
  res.redirect(`/urls/${randString}`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  const email = req.cookies.email;
  const templateVars = { 
    email,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };  
  res.render('urls_show', templateVars);
});  

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let id in ids) {
    if (users[id].email === email && users[id].password === password) {
      const userID = obj;
    }
  }
  if (userID = null) {
    //
  }
  res.cookie('userID', userID);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  const email = req.body.email;
  res.clearCookie('email');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[randomID] = { randomID, email, password }
  res.cookie('email', email);
  res.redirect('/urls');
});
