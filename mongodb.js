const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParse = require("cookie-parser");
const Client = require("./models/client.model.js");
const Faq = require("./models/faq.model.js");
const File = require("./models/file.model.js");
const Cloudinary = require("./cloudinary/index.js");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { Console, error } = require("console");
const cookieParser = require("cookie-parser");
const { collection } = require("./models/user.js");
const User = require("./models/user.js");
const Login = require("./authentication.js");
require("dotenv").config();
const morgan = require("morgan");
const logger = require("./logger"); // Import your logger
const app = express();
const { performance } = require("perf_hooks");
const redis = require("redis");

const errorRateThreshold = 0.05; // 5%
let totalRequests = 0;
let errorCount = 0;

// Use Morgan to log HTTP requests
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Middleware to count requests and errors
app.use((req, res, next) => {
  totalRequests++;
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      errorCount++;
      logger.error(`Error ${res.statusCode}: ${req.method} ${req.url}`);
    }
    const errorRate = errorCount / totalRequests;
    if (errorRate > errorRateThreshold) {
      console.error(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
    }
  });
  next();
});

// Start the timer
const startTime = performance.now();

// Simulate a long-running process
function longRunningProcess(callback) {
  setTimeout(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Duration: ${duration} milliseconds`);
    callback();
  }, 2000);
}

longRunningProcess(() => {
  console.log("Process completed");
  const redisClient = redis.createClient();
  redisClient.on("error", (err) => {
    console.error("Error:", err);
  });
  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });

  const cacheMiddleware = (req, res, next) => {
    const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    redisClient.get(key, (err, data) => {
      if (err) {
        console.error("Error fetching data from Redis:", err);
        return next();
      }
      if (data !== null) {
        res.json(JSON.parse(data));
      } else {
        next();
      }
    });
  };

  // JWT Authentication Middleware
  function authenticateJWT(req, res, next) {
    const tokenReq = req.cookies.accessToken;
    if (tokenReq === undefined) {
      return res
        .status(403)
        .json({ message: "Token has expired please log in again" });
    }
    //console.log(tokenReq);
    if (tokenReq) {
      //console.log(token);

      jwt.verify(tokenReq, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user; // Attach user info to request
        next();
      });
    } else {
      return res.status(401).json({ message: "Authorization header missing" });
    }
  }

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

  //all products
  app.get("/api/users", authenticateJWT, async (req, res) => {
    try {
      if (req.user.credential === "Admin") {
        const users = await User.find({});
        res.status(200).json(users);
      } else {
        res.status(403).json({ message: "Only admins can access this data " });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  //get single product
  app.get("/api/user/:id", authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await Client.findById(id);
      res.status(200).json(client);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user", authenticateJWT, async (req, res) => {
    try {
      const newUser = await User.create(req.body);

      res.status(200).json(newUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //update a product
  app.put("/api/user/:id", authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;

      const userUpdate = await User.findByIdAndUpdate(id, req.body);

      if (!userUpdate) {
        return res.status(404).json({ message: "Client not found" });
      }

      const updatedUser = await User.findById(id);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //delete a product
  app.delete("/api/user/:id", authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;

      const userDelete = await User.findByIdAndDelete(id);

      if (!userDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted succesfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /*
//all products
app.get("/api/clients", authenticateJWT, async (req, res) => {
  try {
    const client = await Client.find({});
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//get single product
app.get("/api/client/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/client", authenticateJWT, async (req, res) => {
  try {
    const client = await Client.create(req.body);

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update a product
app.put("/api/client/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndUpdate(id, req.body);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const updatedClient = await Client.findById(id);
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete a product
app.delete("/api/client/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/

  //faq's
  //all faq's
  app.get("/api/faqs", authenticateJWT, async (req, res) => {
    try {
      const faq = await Faq.find({});
      res.status(200).json(faq);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  //display a desired faq
  app.get("/api/faq/:id", authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await Faq.findById(id);
      res.status(200).json(faq);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //files
  //
  app.get("/api/file", authenticateJWT, async (req, res) => {
    try {
      const file = await File.find({});
      console.log(req.user);
      res.status(200).json(file);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/file/:id", authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;
      const file = await File.findById(id);
      res.status(200).json(file);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //function to calculate average rating score
  function calcAvgRating(ratings) {
    if (ratings.length === 0) {
      return 0;
    }
    //accumalative, current
    const total = ratings.reduce((acc, cur) => acc + cur.rating, 0);
    return (total / ratings.length).toFixed(2);
  }

  //Rating files, user can only rate a specific file once
  app.post("/api/file/rate/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    try {
      const file = await File.findById(id);

      // Ensure the rating is valid
      if (!rating || rating < 0 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 0 and 5." });
      }

      userEmail = req.user.email;
      console.log("userEmail: ", userEmail);
      // const file = File.findById(id);
      if (!file) {
        console.log("File not found");
        return res.status(404).json({ message: "File not found" });
      }
      console.log(id);
      if (!file.ratings || !Array.isArray(file.ratings)) {
        console.log("No ratings found for this file.");
        file.ratings = [];
        file.ratings.push({ userEmail, rating });

        file.save();
        // return res.status(200).json(file);
        return res.status(200).json({
          message: "Rating added successfully",
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          Validation: file.Validation,
          ratings: file.ratings,
          averageRatings: calcAvgRating(file.ratings),
        });
      }
      const ratingExists = await File.find({
        fileName: file.fileName,
        "ratings.userEmail": userEmail,
      });
      console.log(ratingExists);

      if (ratingExists.length != 0) {
        return res
          .status(400)
          .json({ message: "User has already rated this file" });
      }

      file.ratings.push({ userEmail, rating });

      file.save();

      res.status(200).json({
        message: "Rating added successfully",
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        Validation: file.Validation,
        ratings: file.ratings,
        averageRatings: calcAvgRating(file.ratings),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //get files that are not validated
  app.get("/api/file/validate", authenticateJWT, async (req, res) => {
    try {
      if (req.user.credential === "Admin") {
        const files = await File.find({ Validation: false });
        res.status(200).json({ files });
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
  app.get("/api/file/search/:query", authenticateJWT, async (req, res) => {
    const { query } = req.params;

    try {
      const files = await File.find({
        fileName: { $regex: query, $options: "i" }, //"i indicates case insensitive"
      });
      res.status(200).json(files);
    } catch (error) {
      console.error("Error retrieving files:", error);
      res.status(500).json({ message: "Error retrieving files", error });
    }
  });

  //admin will update validation to true after approving file or false when unapproving file
  //if true will get set to false, if false will get set to true
  app.put("/api/file/:id", authenticateJWT, async (req, res) => {
    try {
      if (req.user.credential === "Admin") {
        const { id } = req.params;

        const fileUpdate = await File.findById(id);
        const valUpdate = !fileUpdate.Validation;

        const file = await File.findByIdAndUpdate(
          id,
          { Validation: valUpdate },
          { new: true, runValidators: true }
        ).then((updatedFile) => {
          if (!updatedFile) {
            console.log(error.message);
            res.status(404).json({ message: "Resource not found" });
          } else {
            console.log("File validated: ", updatedFile);
            res.status(200).json(updatedFile);
          }
        });
      } else {
        res.status(403).json({
          message:
            "Invalid Credential: Only Admins may validate or invalidate files",
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //Reporting, if file is reported its validation will be set to false form moderator to review
  app.put("/api/file/report/:id", authenticateJWT, async (req, res) => {
    try {
      const { id } = req.params;

      const valUpdate = false;

      const file = await File.findByIdAndUpdate(
        id,
        { Validation: valUpdate },
        { new: true, runValidators: true }
      ).then((updatedFile) => {
        if (!updatedFile) {
          console.log(error.message);
          res.status(404).json({ message: "Resource not found" });
        } else {
          console.log("File reported: ", updatedFile);
          res.status(200).json(updatedFile);
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //for testing, when db is full of inaccurate data and you want to clear it
  /*
app.delete("/api/file", authenticateJWT, async (req, res) => {
  try {
    //const { id } = req.params;

    const file = await File.deleteMany({});

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ message: "Files deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/

  app.delete("/api/file/:id", authenticateJWT, async (req, res) => {
    try {
      //const file = await File.findByIdAndDelete(id);
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(
    "/api/file",
    authenticateJWT,
    upload.single("file"),
    async (req, res) => {
      const filePath = path.join(__dirname, "/uploads", req.file.originalname);
      //verify JWT token to gain access to user thats logged in
      const tokenReq = req.cookies.accessToken;
      const userUpload = req.user.email;

      console.log(userUpload);
      const resource = Cloudinary.cloudinary.api.resource(
        req.file.originalname,
        { resource_type: "raw" },
        function (error, result) {
          if (error) {
            console.log("File not exists:", error);
            // Upload a file path.join(__dirname, req.file)
            Cloudinary.cloudinary.uploader.upload(
              filePath,
              {
                resource_type: "raw",
                public_id: req.file.originalname,
                overwrite: true,
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
                    });
                    newFile
                      .save()
                      .then((file) => console.log("File created:", file))
                      .catch((err) =>
                        console.error("Error creating file:", err)
                      );
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
            res.status(404).json({
              message: "File already exists, rename the file and try again: ",
              result,
            });
          }
        }
      );
    }
  );
  app.use((err, req, res, next) => {
    logger.error(
      `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
    res.status(500).send("Something went wrong!");
  });

  mongoose
    .connect(process.env.MONGODB_LINK)
    .then(() => {
      console.log("Connected to database");
      app.listen(4000, () => {
        logger.info("Server is running on port 4000");
      });
    })
    .catch(() => {
      const error = new Error("Something went wrong!");
      console.error("Connection failed:", error.message);
    });
});
