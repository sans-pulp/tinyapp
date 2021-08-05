const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000)
    .toString(16)
    .substring(1);
};

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

const users = {
  "218f25": {
    id: "218f25",
    email: "admin@tinyapp.com",
    password: "purplepeopleeater",
  },
};

const urlsDb = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "218f25",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "218f25",
  },
};

app.get("/", (req, res) => {
  const user = req.cookies.user_id;
  if (user) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlsDb);
});

//READ urls
app.get("/urls", (req, res) => {
  let user = req.cookies.user_id;
  const templateVars = { user: users[user], urls: urlsDb };
  res.render("urls_index", templateVars);
});
//CREATE new url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let userID = req.cookies.user_id;
  urlsDb[shortURL] = { longURL, userID };
  console.log(urlsDb);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }
  let user = req.cookies.user_id;
  const templateVars = { user: users[user] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlsDb[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user: users[user],
  };
  if (!templateVars.shortURL) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_show", templateVars);
});
// UPDATE existing longURL
app.post("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlsDb[shortURL] = { longURL, userID };
  res.redirect("/urls");
});

//DELETE url object from Database
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);
  const shortURL = req.params.shortURL;
  delete urlsDb[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlsDb[shortURL].longURL;
  if (id) {
    res.redirect(longURL);
  }
  // else {
  // }
});

app.get("/register", (req, res) => {
  let user = req.cookies.user_id;
  const templateVars = {
    user: users[user],
  };
  res.render("register", templateVars);
});

const emailLookup = (testEmail) => {
  const keys = Object.keys(users);
  for (const key of keys) {
    if (users[key].email === testEmail) {
      return true;
    }
  }
  return false;
};

app.post("/register", (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  //if email/pass is empty string, respond with 400 status code
  if (email === "" || password === "") {
    res.sendStatus(400).send("Email/password cannot be empty!");
  }
  //if email already exists in users, respond with 400 status code..
  if (emailLookup(email) === true) {
    res.sendStatus(400).send("Email already exists in Db!");
  }
  let id = generateRandomString();
  // add a new user object to global users.
  users[id] = {
    id,
    email,
    password,
  };
  //set user_id cookie containing user's newly generated ID
  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let user = req.cookies.user_id;
  const templateVars = {
    user: users[user],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //lookup the email address in the user object
  if (emailLookup(email) === false) {
    res.status(403).send("Email does not exist in Db! Please register");
  }
  if (emailLookup(email) === true) {
    for (const user in users) {
      if (password === users[user].password) {
        res.cookie("user_id", user);
        res.redirect("/urls");
      }
    }
    res.status(403).send("Incorrect password!");
  }
});

app.post("/logout", (req, res) => {
  console.log(req.body);
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
