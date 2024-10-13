// const express = require("express");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const bcrypt = require("bcrypt");
// const User = require("./models/user");

// const app = express();
// app.set("view engine", "ejs");
// app.set("views", "views");

// mongoose
//   .connect(
//     "mongodb+srv://salimsofinia:Salim123@backenddb.4f0qd.mongodb.net/Share2Teach?retryWrites=true&w=majority&appName=BackendDB",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then(() => {
//     console.log("MongoDB Connected!");
//   })
//   .catch((err) => {
//     console.error("MongoDB Connection Error:", err);
//   });

// app.set("view engine", "ejs");
// app.set("views", "views");

// app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// const requireLogin = (req, res, next) => {
//   if (!req.session.user_id) {
//     console.log("No user_id in session");
//     return res.redirect("/login");
//   }
//   next();
// };

// app.get("/register", (req, res) => {
//   res.render("register");
// });

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.get("/", requireLogin, async (req, res) => {
//   if (!req.session.user_id) {
//     return res.redirect("/login");
//   }
//   try {
//     const user = await User.findById(req.session.user_id);
//     if (!user) {
//       req.session.destroy(() => {
//         res.redirect("/login");
//       });
//     } else {
//       res.render("home", { user: user });
//     }
//   } catch (err) {
//     console.error("Error fetching user data:", err);
//     res.redirect("/login");
//   }
// });

// //

// app.get("/faq", (req, res) => {
//   res.render("faq");
// });

// app.get("/registerrole", requireLogin, (req, res) => {
//   if (!req.session.user_id) {
//     return res.redirect("/login");
//   }
//   User.findById(req.session.user_id, (err, user) => {
//     if (err || !user) {
//       req.session.destroy(() => {
//         res.redirect("/login");
//       });
//     } else if (user.credential !== "Admin") {
//       res.redirect("/");
//     } else {
//       res.render("registerrole");
//     }
//   });
// });

// //

// app.post("/register", async (req, res) => {
//   try {
//     const { firstname, lastname, email, affiliation, credential, password } =
//       req.body;
//     const user = new User({
//       firstname,
//       lastname,
//       email,
//       affiliation,
//       credential,
//       password,
//     });
//     await user.save();
//     res.redirect("/login");
//   } catch (err) {
//     console.error(err);
//     res.send("Registration failed. Please try again.");
//   }
// });

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const foundUser = await User.findAndValidate(email, password);
//     if (foundUser) {
//       req.session.user_id = foundUser._id;
//       console.log("Session user_id set:", email);
//       res.redirect("/");
//     } else {
//       console.log("Invalid email or password");
//       res.redirect("/login");
//     }
//   } catch (err) {
//     console.error("Error during login:", err);
//     res.redirect("/login");
//   }
// });

// app.post("/", (req, res) => {
//   req.session.destroy();
//   res.redirect("/login");
// });

// app.post("/logout", (req, res) => {
//   req.session.destroy(() => {
//     res.redirect("/login");
//   });
// });

// app.listen(3000, () => {
//   console.log("Server running on port 3000!");
// });

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

mongoose
  .connect(
    "mongodb+srv://salimsofinia:Salim123@backenddb.4f0qd.mongodb.net/Share2Teach?retryWrites=true&w=majority&appName=BackendDB",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(cookieParser());

/*const*/ function requireLogin(req, res, next) {
  const accessToken = req.cookies.accessToken;
  if (accessToken === undefined) {
    return res.redirect("/login");
    //return res.status(403).json({ message: "Token has expired" });
  }
  if (accessToken) {
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err.message);
      } else {
        // Extracted data from the token
        //console.log("User:", decoded);
        // Access payload fields
        //console.log("ID:", decoded.id);
        const tokenID = decoded.id;
        const user = User.findById(tokenID);
        if (!user) {
          return res.redirect("/login");
        }
        req.user = decoded;
        next();
      }
    });
  }

  /*if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();*/
}

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.json(error.message);
  }
});

app.get("/faq", requireLogin, (req, res) => {
  res.render("faq");
});

app.get("/registerrole", requireLogin, async (req, res) => {
  console.log(req.user.credential);
  //const user = User.findById(req.user.id);
  //console.log(user.email);
  if (req.user && req.user.credential === "Admin") {
    res.render("registerrole");
  } else {
    res.redirect("/");
  }

  //const user = await User.findById(req.session.user_id);
  /*if (user && user.credential === "Admin") {
    res.render("registerrole");
  } else {
    res.redirect("/");
  }*/
});

//What is role text box?
/*
app.post("/registerrole", requireLogin, async (req, res) => {
  try {
    if (req.user && req.user.credential === "Admin") {
      const {
        firstname,
        lastname,
        email,
        affiliation,
        credential,
        password,
        role,
      } = req.body;
      const user = new User({
        firstname,
        lastname,
        email,
        affiliation,
        credential,
        password,
        role,
      });
      await user.save();
      res.redirect("/login");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
});*/

app.get("/login", (req, res) => {
  if (req.cookies.accessToken) {
    res.redirect("/"); // Redirect to home if already logged in
  } else {
    res.render("login");
  }
});

app.get("/register", (req, res) => {
  if (req.cookies.accessToken) {
    res.redirect("/"); // Redirect to home if already logged in
  } else {
    res.render("register");
  }
});

app.get("/", requireLogin, async (req, res) => {
  let user = null;
  console.log(req.user.id);
  const userID = req.user.id;
  if (req.user) {
    user = await User.findById(userID);
  }
  res.render("home", { user: user });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findAndValidate(email, password);
  if (foundUser) {
    const user = {
      id: foundUser._id,
      email: foundUser.email,
      credential: foundUser.credential,
    };

    const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Set the token in an HttpOnly cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Prevent access via JavaScript
      secure: true, // Only send over HTTPS
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 3600000, // Cookie expiry time (in milliseconds) (1 hour)
    });

    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err.message);
      } else {
        // Extracted data from the token
        //console.log("Decoded Token Data:", decoded);
        // Access payload fields
        console.log("Username:", decoded.email);
        //userUpload = decoded.username;
      }
    });
    //res.json({ accessToken });
    console.log();
    res.redirect("/");

    //req.session.user_id = foundUser._id;
    //res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", async (req, res) => {
  const { firstname, lastname, email, affiliation, credential, password } =
    req.body;
  const user = new User({
    firstname,
    lastname,
    email,
    affiliation,
    credential,
    password,
  });
  await user.save();
  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  Object.keys(req.cookies).forEach((cookieName) => {
    res.clearCookie(cookieName);
  });
  console.log("All cookies destroyed");

  /* req.session.destroy(() => {
    res.redirect("/login");
  });*/
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server running on port 3000!");
});
