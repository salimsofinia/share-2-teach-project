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
const Report = require("./models/report.model.js");
const UserAction = require("./models/user_actions.model.js");
const Modhistory = require("./models/modhistory.js");
require("dotenv").config();

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

const app = express();

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
//show all files
app.get("/api/file", async (req, res) => {
  try {
    const file = await File.find({});
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
    const useraction = new UserAction({
      action: "Get File",
    });
    useraction.save();
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
app.get("/api/file/search/:query", async (req, res) => {
  const { query } = req.params;

  try {
    const files = await File.find({
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
      const { validation, comments } = req.body;
      //for moderation history purposes
      const oldFile = await File.findById(id);
      if (oldFile) {
        const valUpdate = validation;

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
              newValidation: validation,
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
    res.status(200).json({ modHistory });
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
        .status(500)
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

mongoose
  .connect(process.env.MONGODB_LINK)
  .then(() => {
    console.log("Connected to database");
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch(() => {
    const error = new Error("Something went wrong!");
    console.error("Connection failed:", error.message);
  });
