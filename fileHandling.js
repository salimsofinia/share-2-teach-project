const express = require("express");
const app = express();
const Cloudinary = require("./cloudinary/index.js");

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

app.post("/api/upload", upload.single("fileName"), (req, res) => {
  res.json(req.file);

  // Upload a file path.join(__dirname, req.file)
  Cloudinary.cloudinary.uploader.upload(
    path.join(__dirname, "/uploads", req.file.originalname),
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
        console.log("File JSON Response:", result);
      }
    }
  );
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("listening on port " + port);
});
