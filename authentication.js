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
}

app.get("/faq", requireLogin, (req, res) => {
  res.render("faq");
});

app.get("/registerrole", requireLogin, async (req, res) => {
  if (req.user && req.user.credential === "Admin") {
    res.render("registerrole");
  } else {
    res.redirect("/");
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
});*/
/*
//if token exists in cookies then user is logged in
app.get("/login", (req, res) => {
  if (req.cookies.accessToken) {
    res.redirect("/"); // Redirect to home if already logged in
  } else {
    res.render("login");
  }
});

//if token exists in cookies then user is logged in
app.get("/register", (req, res) => {
  if (req.cookies.accessToken) {
    res.redirect("/"); // Redirect to home if already logged in
  } else {
    res.render("register");
  }
});

//if user is logged in and found in db then go to home page
app.get("/", requireLogin, async (req, res) => {
  let user = null;
  const userID = req.user.id;
  if (req.user) {
    user = await User.findById(userID);
  }
  res.render("home", { user: user });
});

//user login and token generation
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //search in db if user email and password are correct
  const foundUser = await User.findAndValidate(email, password);
  //if found create user with same details that will appear in payload of generated JWT token
  if (foundUser) {
    const user = {
      id: foundUser._id,
      email: foundUser.email,
      credential: foundUser.credential,
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


module.exports = app;
*/

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
//const User = require("./models/user");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
const UserAction = require("./models/user_actions.model.js");
const app = express();
const cors = require("cors");
const Faq = require("./models/faq.model.js");
const File = require("./models/file.model.js");
const Cloudinary = require("./cloudinary/index.js");
const fs = require("fs");
const multer = require("multer");
const { Console, error } = require("console");
const { collection } = require("./models/user.js");
const User = require("./models/user.js");
const Report = require("./models/report.model.js");
const Modhistory = require("./models/modhistory.js");
const axios = require("axios");
require("dotenv").config();

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
function authenticateJWT(req, res, next) {
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

//new user is created and saved in db
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
  //when user has been created then go back to login page
  res.redirect("/login");
});

//when user logs out all cookies are destroyed, this includes the access token
app.post("/logout", (req, res) => {
  Object.keys(req.cookies).forEach((cookieName) => {
    res.clearCookie(cookieName);
  });
  console.log("All cookies destroyed");
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server running on port 3000!");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Node API");
});

//get useractions
app.get("/api/useractions", authenticateJWT, async (req, res) => {
  try {
    const useractions = await UserAction.find({});
    const useraction = new UserAction({
      action: "Get User Actions",
    });
    useraction.save();
    res.status(200).json(useractions);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//all users
app.get("/api/users", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const users = await User.find({});
      const useraction = new UserAction({
        action: "Get Users",
      });
      useraction.save();
      res.status(200).json(users);
    } else {
      res.status(403).json({ message: "Only admins can access this data " });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//get single user
app.get("/api/user/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const useraction = new UserAction({
      action: "Get User",
    });
    useraction.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//create new user
app.post("/api/user", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const newUser = await User.create(req.body);
      const useraction = new UserAction({
        action: "Create User",
      });
      useraction.save();
      res.status(200).json(newUser);
    } else {
      res.status(403).json({ message: "Only admins can access this data " });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update a user
app.put("/api/user/:id", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const { id } = req.params;

      const userUpdate = await User.findByIdAndUpdate(id, req.body);

      if (!userUpdate) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await User.findById(id);
      const useraction = new UserAction({
        action: "Update User",
      });
      useraction.save();
      res.status(200).json(updatedUser);
    } else {
      res.status(403).json({ message: "Only admins can access this data " });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete a user
app.delete("/api/user/:id", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const { id } = req.params;

      const userDelete = await User.findByIdAndDelete(id);

      if (!userDelete) {
        return res.status(404).json({ message: "User not found" });
      }
      const useraction = new UserAction({
        action: "Delete User",
      });
      useraction.save();
      res.status(200).json({ message: "User deleted succesfully" });
    } else {
      res.status(403).json({ message: "Only admins can access this data " });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//faq's
//all faq's
app.get("/api/faqs", async (req, res) => {
  try {
    const faq = await Faq.find({});
    const useraction = new UserAction({
      action: "Get FAQ",
    });
    console.log(faq);
    useraction.save();
    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//display a desired faq
app.get("/api/faq/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findById(id);
    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/faq", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faqAdd = new Faq({ question, answer });
    await faqAdd.save();
    res.status(200).json({ message: "Faq added: ", faqAdd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/faq/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const delFaq = await Faq.findByIdAndDelete(id);
    res.status(200).json({ message: "Faq deleted successfully", delFaq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//files
//show all files that have been validated
app.get("/api/file", async (req, res) => {
  try {
    const file = await File.find({ Validation: true });
    const useraction = new UserAction({
      action: "Get All Files",
    });
    useraction.save();
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get specific file
app.get("/api/file/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    // If file not found in the database
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Fetch the resource details from Cloudinary
    const result = await Cloudinary.cloudinary.api.resource(file.fileName, {
      resource_type: "raw",
    });

    const fileUrl = result.secure_url; // Get the secure URL for the file

    // Use Axios to get the file
    const response = await axios.get(fileUrl, {
      responseType: "stream", // Important to get the file as a stream
    });

    // Set headers to force download
    res.set({
      "Content-Disposition": `attachment; filename="${file.fileName}"`, // Set filename here
      "Content-Type": file.fileType || "application/octet-stream", // Set the correct content type
    });

    // Pipe the response data to the client
    response.data.pipe(res);

    // Handle stream end
    response.data.on("end", () => {
      console.log("File stream finished");
    });

    // Handle stream errors
    response.data.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).json({ message: "Error reading file" });
    });
  } catch (error) {
    console.error("Error in /api/file/:id route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
//function to calculate average rating score
function calcAvgRating(ratings) {
  console.log(ratings);
  if (ratings.length === 0) {
    return 0;
  }
  let sum = 0;

  ratings.forEach((rating) => {
    sum += rating;
  });

  console.log(sum);
  return (sum / ratings.length).toFixed(2);
}

//Rating files
app.post("/api/file/rate/:id", async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  //local storage on browsers could be implented to minimize a user rating a file multiple times
  try {
    const file = await File.findById(id);

    // Ensure the rating is valid
    if (!rating || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5." });
    }

    if (!file) {
      console.log("File not found");
      return res.status(404).json({ message: "File not found" });
    }
    const updatedFile = await File.findByIdAndUpdate(
      file.id,
      { $push: { ratings: rating } },
      { new: true }
    );

    const useraction = new UserAction({
      action: "File Rate",
    });
    useraction.save();
    res.status(200).json({
      message: "Rating added successfully",
      fileName: updatedFile.fileName,
      fileUrl: updatedFile.fileUrl,
      Validation: updatedFile.Validation,
      ratings: updatedFile.ratings,
      averageRatings: calcAvgRating(updatedFile.ratings),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get files that are not validated
app.get("/api/files/validate", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === "Admin" || req.user.role === "Moderator") {
      const files = await File.find({ Validation: false });
      const useraction = new UserAction({
        action: "Get Files Unvalidated",
      });
      useraction.save();
      res.status(200).json(files);
    } else {
      res.status(403).json({
        message: "Invalid Credential: Only Admins may validate files",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving files: ", error });
  }
});

//Search for files containing text in their file name
app.get("/api/file/search/:query", async (req, res) => {
  const { query } = req.params;

  try {
    const files = await File.find({
      Validation: true,
      $or: [
        { fileName: { $regex: query, $options: "i" } }, //"i indicates case insensitive"},
        { subject: { $regex: query, $options: "i" } }, //"i indicates case insensitive"},
        { grade: { $regex: query, $options: "i" } }, //"i indicates case insensitive"},
      ],
    });

    const useraction = new UserAction({
      action: "File Search",
    });
    useraction.save();
    res.status(200).json(files);
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ message: "Error retrieving files", error });
  }
});

//admin will update validation to true after approving file or false when unapproving file and add moderator's comments
app.put("/api/file/:id", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === "Admin" || req.user.role === "Moderator") {
      const { id } = req.params;
      const { Validation, comments } = req.body;
      //for moderation history purposes
      const oldFile = await File.findById(id);
      if (oldFile) {
        const valUpdate = Validation;
        console.log(Validation);
        const file = await File.findByIdAndUpdate(
          id,
          { Validation: valUpdate, comments: comments },
          { new: true, runValidators: true }
        ).then((updatedFile) => {
          if (!updatedFile) {
            console.log(error.message);
            res.status(404).json({ message: "Resource not found" });
          } else {
            console.log("File moderated: ", updatedFile);
            const modhistory = new Modhistory({
              moderator: req.user.email,
              fileName: oldFile.fileName,
              oldValidation: oldFile.Validation,
              oldComments: oldFile.comments,
              newValidation: Validation,
              newComments: comments,
            });
            modhistory.save();

            const useraction = new UserAction({
              action: "File Moderate",
            });
            useraction.save();
            res.status(200).json(updatedFile);
          }
        });
      } else {
        res.status(403).json({
          message:
            "Invalid Credential: Only Admins may validate or invalidate files",
        });
      }
    } else {
      console.log(error.message);
      res.status(404).json({ message: "Resource not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//show moderation history
app.get("/api/modhistory", async (req, res) => {
  try {
    const modHistory = await Modhistory.find({});
    res.status(200).json(modHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//show all reports
app.get("/api/report", async (req, res) => {
  try {
    const reports = await Report.find({});
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Reporting, if file is reported report gets added to database
app.post("/api/file/report/:id", async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;

    const file = await File.findById(id);
    if (file) {
      const fileName = file.fileName;
      console.log(fileName);
      const report = new Report({ file: fileName, reason: reason });
      await report.save();
      const useraction = new UserAction({
        action: "File Report",
      });
      useraction.save();
      res
        .status(200)
        .json({ message: "Report submitted for file: ", fileName });
    } else {
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/file/:id", authenticateJWT, async (req, res) => {
  try {
    if (req.user) {
      const { id } = req.params;
      File.findByIdAndDelete(id)
        .then((deletedFile) => {
          if (deletedFile) {
            console.log("File deleted from db:", deletedFile);
            Cloudinary.cloudinary.uploader.destroy(
              deletedFile.fileName,
              { resource_type: "raw" },
              function (error, result) {
                if (error) {
                  console.error("Error deleting file:", error);
                  res.status(404).json({
                    success: false,
                    message:
                      "File with id " + deletedFile.fileName + " not found",
                  });
                } else {
                  //send message that file is successfully deleted
                  const useraction = new UserAction({
                    action: "File Delete",
                  });
                  useraction.save();
                  res.status(200).json({
                    success: true,
                    message: "File with id " + id + " successfully deleted: ",
                  });
                }

                console.log("File Deleted from Cloudinary:", result);
              }
            );
          } else {
            console.log("File not found");
            res.status(404).json({ message: "File not found" });
          }
        })
        .catch((err) => {
          console.error("Error deleting file:", err);
          //res.status(404).json({ message: "File not found" });
        });
    } else {
      res.status(403).json({
        message:
          "Invalid Credential: Only Admins, Moderators or Educators may contribute or delete files",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post(
  "/api/file",
  authenticateJWT,
  upload.single("file"),
  async (req, res) => {
    try {
      const { subject, grade } = req.body;
      if (req.user) {
        const filePath = path.join(
          __dirname,
          "/uploads",
          req.file.originalname
        );
        //verify JWT token to gain access to user thats logged in
        const tokenReq = req.cookies.accessToken;
        const userUpload = req.user.email;

        console.log(userUpload);
        const resource = Cloudinary.cloudinary.api.resource(
          req.file.originalname,
          { resource_type: "raw" },
          function (error, result) {
            if (error) {
              console.log("File does not exist:", error);
              // Upload a file path.join(__dirname, req.file)
              Cloudinary.cloudinary.uploader.upload(
                filePath,
                {
                  resource_type: "raw",
                  public_id: req.file.originalname,
                  overwrite: false,
                },
                function (error, result) {
                  console.log("File Uploaded Successfully!");
                  console.log(filePath);
                  console.log(req.originalname);
                  console.log(result);
                  console.log(result.secure_url);
                  const uploadedUrl = result.secure_url;

                  if (error) {
                    console.error("Upload Error:", error);
                  } else {
                    try {
                      const newFile = new File({
                        fileName: req.file.originalname,
                        fileUrl: uploadedUrl,
                        Validation: false,
                        fileSize: req.file.size,
                        fileType: req.file.mimetype,
                        uploadUser: userUpload,
                        subject: subject,
                        grade: grade,
                      });
                      newFile
                        .save()
                        .then((file) => console.log("File created:", file))
                        .catch((err) =>
                          console.error("Error creating file:", err)
                        );
                      const useraction = new UserAction({
                        action: "File Upload",
                      });
                      useraction.save();
                      res.status(200).json(newFile);
                    } catch (error) {
                      res.status(500).json({ message: error.message });
                    }

                    //remove file that is stored locally
                    fs.unlink(filePath, (error) => {
                      if (error) {
                        console.log(error.message);
                      }
                    });
                  }
                }
              );
            } else {
              console.log("File already exists: ", result);
              //remove file that is stored locally
              fs.unlink(filePath, (error) => {
                if (error) {
                  console.log(error.message);
                }
              });
              res.status(404).json({
                message: "File already exists, rename the file and try again: ",
                result,
              });
            }
          }
        );
      } else {
        res.status(403).json({
          message:
            "Invalid Credential: Only Admins, Moderators or Educators may contribute or delete files",
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = app;
