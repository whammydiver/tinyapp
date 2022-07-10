# Welcome to Tinyapp!

Tinyapp runs on port 8080.


- Instructions for how to set up and run your project, as well as the project's dependencies, should be included in your README.
- cookie-parser should be removed as a dependency since it has been replaced by cookie-session.
- If the user is not logged in, GET /urls/new should redirect to the login page, instead of just rendering it. The same feedback should be applied to the POST/urls and PATCH /urls/:shortURL/edit routes.
- It is only possible to send one response for each request (res.sent(), res.render(), res.redirect()). If you try to send more than one response you will see the console error ERR_HTTP_HEADERS_SENT. Make sure that your code only ever sends one response by making use of return or if/else statements.
- console.log statements that were used for debugging should be removed.
- Empty strings are falsy, so (!email || !password) is the same as (email === '' || password === '').
- There is inconsistent use of single and double quotes (' and "). - To ensure your code is written in a consistent style, pick one and stick with it throughout the project.
- When an empty username or password is given to POST /register, it displays an error but still creates the user.
- GET /u/:shortURL should work for users that are not logged in. Currently it displays an error.
- Special characters such as @*! should not be used in links.
- The root URL should redirect to /urls when logged in.
- GET /login and GET /register should redirect to /urls if the user is already logged in.
- POST /logout does not properly delete the current session, you can see this by using Inspect in Chrome, then looking under the Application tab to make sure the session gets cleared when logging out.


If you navigate to localhost:8080, it should redirect you to the login page. 

1 user account exist for testing purposes and some sample url records are attached to each. 
user@example.com, password: hello

New users must register first by entering an email address and creating a password. Registering as a new user will also automatically log you in. Your logged in status is displayed in the app header.

Registration should fail if a user account already exists. Similarly, login will fail if the password provided doesn't match the user email (or if the email is not yet registered).

Once logged in, users can add new urls, modify existing longform urls, and delete urls from the library if no longer needed. 

Security is managed with hashed passwords (no plain text passwords are stored) and cookies are also encrypted. 

Enjoy!

!["Actual Tinyapp screenshot!"](./tinyappScreenshot.jpg)

tinyapp dependencies:
- bcrypt
- body-parser
- cookie-session
- ejs
- express
- method-override
