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
  const userName = req.cookies.username;
  const templateVars = { urls: urlDatabase, userName };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userName = req.cookies.username;
  res.render('urls_new', {userName});
});

app.get('/urls/:shortURL', (req, res) => {
  const userName = req.cookies.username
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL] 

  const templateVars = { userName, shortURL, longURL };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  const randString = generateRandomString();
  urlDatabase[randString] = "https://" + req.body.longURL;
  const templateVars = { 
    userName: req.cookies[userName],
    shortURL: randString, longURL: "https://" + req.body.longURL 
  };
  res.redirect(`/urls/${randString}`);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  console.log(req.body);
  const userName = req.body.username;
  res.cookie('username', userName);
  res.redirect('/urls');
})