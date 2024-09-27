const express = require("express");
const app = express();
const Cloudinary = require("./cloudinary/index.js");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const path = require("path");

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

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json(req.file);
  // Upload a file
  Cloudinary.cloudinary.uploader.upload(
    path.join(__dirname, req.file),
    function (error, result) {
      if (error) {
        console.error("Upload Error:", error);
      } else {
        console.log("File JSON Response:", result);
      }
    }
  );
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("listening on port " + port);
});
