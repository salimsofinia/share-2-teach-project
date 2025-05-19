const express = require("express");
const app = express();
const User = require("./models/user");
const mongoose = require("mongoose");

const session = require("express-session");

mongoose
  .connect(
    "",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "not a good secret" }));

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/homepage", (req, res) => {
  res.render("homepage");
});

app.get("/homepage", requireLogin, (req, res) => {
  // if (!req.session.user_id) {
  //   res.redirect("/login");
  // }
  res.render("homepage");
  //res.send("THIS IS SECRET! YOU CANNOT SEE ME UNLESS YOU ARE LOGGED IN.");
});

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  // const hash = await bcrypt.hash(password, 12);
  const user = new User({ username, password });
  await user.save();
  //res.send(hash);
  res.redirect("/login");
});

// app.get("/register-ed", (req, res) => {
//   res.send("register-ed");
//   setTimeout(() => {
//     console.log("5 seconds have passed");
//   }, 5000);
//   res.redirect("/login");
// });

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // const user = await User.findOne({ username });
  // const validPassword = await bcrypt.compare(password, user.password);
  const foundUser = await User.findAndValidate(username, password);
  //if (validPassword) {
  if (foundUser) {
    req.session.user_id = user._id;
    res.send("auth is good");
  } else {
    res.send("auth failed");
    res.redirect("/login");
  }
});

app.post("/homepage", (req, res) => {
  req.session.user_id = null;
  //req.session.destroy();
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("SERVING YOUR APP!");
});
