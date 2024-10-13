const express = require("express");
const app = express();
const Cloudinary = require("./cloudinary/index.js");
const fs = require("fs");
const axios = require("axios");

const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/api/download/:id", (req, res) => {
  // Get details for a file with public_id
  const { id } = req.params;
  Cloudinary.cloudinary.api.resource(id, function (error, result) {
    if (error) {
      console.error("Error retrieving file:", error);
    } else {
      //get file url used to download file
      res.send(result.secure_url);
      console.log("File URL:", result.secure_url);
    }
  });
});

app.delete("/api/delete/:id", (req, res) => {
  // Get details for a file with public_id
  const { id } = req.params;
  //search if file exists
  Cloudinary.cloudinary.api.resource(id, function (error, result) {
    if (error) {
      console.log("Error: " + error.message);
      res.status(404).json({
        success: false,
        message: "File with id " + id + " not foundsearc",
      });
    } else {
      //if file exists then delete
      Cloudinary.cloudinary.uploader.destroy(id, function (error, result) {
        if (error) {
          console.error("Error deleting file:", error);
          res.status(404).json({
            success: false,
            message: "File with id " + id + " not found",
          });
        } else {
          //send message that file is successfully deleted
          res.status(200).json({
            success: true,
            message: "File with id " + id + " successfully deleted",
          });
          console.log("File Deleted:", id);
        }
      });
    }
  });
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json(req.file);
  const filePath = path.join(__dirname, "/uploads", req.file.originalname);
  // Upload a file path.join(__dirname, req.file)
  Cloudinary.cloudinary.uploader.upload(
    filePath,
    {
      resource_type: "image",
      public_id: req.file.originalname,
      overwrite: true,
    },
    function (error, result) {
      if (error) {
        console.error("Upload Error:", error);
      } else {
        console.log("File Uploaded Successfully!");
        console.log("");
        console.log(result.secure_url);
        const uploadedUrl = result.secure_url;

        console.log("File JSON Response:", result);

        Cloudinary.cloudinary.api.resource(
          req.file.originalname,
          function (error, result) {
            if (error) {
              console.error("Error retrieving file:", error);
            } else {
              try {
                const file = File.create(result.secure_url);
                res.status(200).json(file);
              } catch (error) {
                res.status(500).json({ message: error.message });
              }

              res.send(result.secure_url);
              console.log("File URL:", result.secure_url);
            }
          }
        );
        //remove file that is stored locally
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(error.message);
          }
        });
      }
    }
  );
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("listening on port " + port);
});
