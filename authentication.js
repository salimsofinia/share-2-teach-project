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
/*
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const routes = require("./mongodb.js");
const UserAction = require("./models/user_actions.model.js");
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

mongoose
  .connect(process.env.MONGODB_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

//function that runs as middleware in requests
function requireLogin(req, res, next) {
  try {
    //get access token from cookie that gets generated when user logs in
    const accessToken = req.cookies.accessToken;
    //undefined means no token was generated or it has expired, user has to log in again to gain a token
    if (accessToken === undefined) {
      return res.redirect("/login");
      //return res.status(403).json({ message: "Token has expired" });
    }
    //if access token was generated then verify it
    if (accessToken) {
      jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error("Token verification failed:", err.message);
        } else {
          //get user id from decoded token
          const tokenID = decoded.id;
          //get user details from database using userID that was gained from token
          const user = User.findById(tokenID);
          //if user is not found return to login page
          if (!user) {
            return res.redirect("/login");
          }
          //attach found user to the request that called the middleware function
          req.user = decoded;
          //allow the request that called the middleware function to continue
          next();
        }
      });
    }
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
}

app.get("/faq", requireLogin, (req, res) => {
  try {
    res.render("faq");
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

app.get("/registerrole", requireLogin, async (req, res) => {
  try {
    if (req.user && req.user.role === "Admin") {
      res.render("registerrole");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

//What is role text box if credential already exists?
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
});*

//if token exists in cookies then user is logged in
app.get("/login", (req, res) => {
  try {
    if (req.cookies.accessToken) {
      res.redirect("/"); // Redirect to home if already logged in
    } else {
      res.render("login");
    }
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

//if token exists in cookies then user is logged in
app.get("/register", (req, res) => {
  try {
    if (req.cookies.accessToken) {
      res.redirect("/"); // Redirect to home if already logged in
    } else {
      res.render("register");
    }
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

//if user is logged in and found in db then go to home page
app.get("/", requireLogin, async (req, res) => {
  try {
    let user = null;
    const userID = req.user.id;
    if (req.user) {
      user = await User.findById(userID);
    }
    res.render("home", { user: user });
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

//user login and token generation
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //search in db if user email and password are correct
    const foundUser = await User.findAndValidate(email, password);
    //if found create user with same details that will appear in payload of generated JWT token
    if (foundUser) {
      const user = {
        id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
      };
      //token is signed with user details and will expire in 1 hour
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
          console.log("Token verified and is valid");
          // Access payload fields
          console.log("User email:", decoded.email);
        }
      });
      console.log();
      const useraction = new UserAction({
        action: "Login",
      });
      useraction.save();
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

//new user is created and saved in db
app.post("/register", requireLogin, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const {
        firstname,
        lastname,
        email,
        affiliation,
        credential,
        role,
        password,
      } = req.body;
      const user = new User({
        firstname,
        lastname,
        email,
        affiliation,
        credential,
        role,
        password,
      });
      await user.save();

      //when user has been created then go back to login page
      res.redirect("/login");
    } else {
      res.send("Only admins may register new users");
      res.redirect("/login");
    }
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

//when user logs out all cookies are destroyed, this includes the access token
app.post("/logout", (req, res) => {
  try {
    Object.keys(req.cookies).forEach((cookieName) => {
      res.clearCookie(cookieName);
    });
    console.log("All cookies destroyed");
    const useraction = new UserAction({
      action: "Logout",
    });
    useraction.save();
    res.redirect("/login");
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000!");
});

module.exports = app;
*/

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const routes = require("./mongodb.js");
const UserAction = require("./models/user_actions.model.js");
const app = express();
const cors = require("cors");
//app.set("view engine", "ejs");
//app.set("views", "views");

mongoose
  .connect(process.env.MONGODB_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
app.use(cors());
app.use(express.static(path.join(__dirname, "views")));
//function that runs as middleware in requests
function requireLogin(req, res, next) {
  try {
    //get access token from cookie that gets generated when user logs in
    const accessToken = req.cookies.accessToken;
    //undefined means no token was generated or it has expired, user has to log in again to gain a token
    if (accessToken === undefined) {
      return res.status(403).json({ message: "Token has expired" });
    }
    //if access token was generated then verify it
    if (accessToken) {
      jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error("Token verification failed:", err.message);
        } else {
          //get user id from decoded token
          const tokenID = decoded.id;
          //get user details from database using userID that was gained from token
          const user = User.findById(tokenID);
          //if user is not found return to login page
          if (!user) {
            return res.status(403).json({ message: "User not found" });
          }
          //attach found user to the request that called the middleware function
          req.user = decoded;
          //allow the request that called the middleware function to continue
          next();
        }
      });
    }
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
}
app.get("/", (req, res) => {
  res.redirect("/landing.html");
});
//What is role text box if credential already exists?

//if token exists in cookies then user is logged in
app.get("/api/login", (req, res) => {
  try {
    if (req.cookies.accessToken) {
      res.status(200).json({ message: "User is logged in: " }); // Redirect to home if already logged in
    } else {
      res.status(401).json({ message: "User not logged in" });
    }
  } catch (error) {
    res.status(500).json(error.message);
    console.log(error.message);
  }
});

//user login and token generation
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //search in db if user email and password are correct
    const foundUser = await User.findAndValidate(email, password);
    //if found create user with same details that will appear in payload of generated JWT token
    if (foundUser) {
      const user = {
        id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
      };
      //token is signed with user details and will expire in 1 hour
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
          console.log("Token verified and is valid");
          // Access payload fields
          console.log("User email:", decoded.email);
        }
      });
      console.log();
      const useraction = new UserAction({
        action: "Login",
      });
      useraction.save();
      return res.status(200).json({
        message: "User logged in successfully",
        role: foundUser.role,
      });
    } else {
      res
        .status(401)
        .json({ message: "Login failed: user or password incorrect" });
    }
  } catch (error) {
    res.status(500).json(error.message);
    console.log(error.message);
  }
});

//testing
app.get("/api/users", async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

//new user is created and saved in db
app.post("/api/register", requireLogin, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const {
        firstname,
        lastname,
        email,
        affiliation,
        credential,
        role,
        password,
      } = req.body;
      const user = new User({
        firstname,
        lastname,
        email,
        affiliation,
        credential,
        role,
        password,
      });
      await user.save();

      //when user has been created then go back to login page
      res.status(200).json({ message: "user created successfully", user });
    } else {
      res.status(403).json("Only admins may register new users");
    }
  } catch (error) {
    res.status(500).json(error.message);
    console.log(error.message);
  }
});

//when user logs out all cookies are destroyed, this includes the access token
app.post("/api/logout", (req, res) => {
  try {
    Object.keys(req.cookies).forEach((cookieName) => {
      res.clearCookie(cookieName);
    });
    console.log("All cookies destroyed");
    const useraction = new UserAction({
      action: "Logout",
    });
    useraction.save();
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json(error.message);
    console.log(error.message);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000!");
});

module.exports = app;
