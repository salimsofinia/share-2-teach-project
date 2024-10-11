const express = require("express");
const mongoose = require("mongoose");
const Client = require("./models/client.model.js");
const Faq = require("./models/faq.model.js");
const File = require("./models/file.model.js");
const Cloudinary = require("./cloudinary/index.js");
const fs = require("fs");
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

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Node API");
});
//all products
app.get("/api/clients", async (req, res) => {
  try {
    const client = await Client.find({});
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//get single product
app.get("/api/client/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/client", async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update a product
app.put("/api/client/:id", async (req, res) => {
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
app.delete("/api/client/:id", async (req, res) => {
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
});

//faq's
//all faq's
app.get("/api/faqs", async (req, res) => {
  try {
    const faq = await Faq.find({});
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

//files
//
app.get("/api/files", async (req, res) => {
  try {
    const file = await File.find({});
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/file/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/file/:id", async (req, res) => {
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
          //res.status(404).json({ message: "File not found" });
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

app.post("/api/file", upload.single("file"), async (req, res) => {
  const filePath = path.join(__dirname, "/uploads", req.file.originalname);
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
      console.log("");
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
          });
          newFile
            .save()
            .then((file) => console.log("File created:", file))
            .catch((err) => console.error("Error creating file:", err));
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
});

mongoose
  .connect(
    //"mongodb+srv://lohardjvr27:Lohard%401@backenddb.4f0qd.mongodb.net/Share2Teach?retryWrites=true&w=majority&appName=BackendDB"
    "mongodb+srv://salimsofinia:Salim123@backenddb.4f0qd.mongodb.net/Share2Teach?retryWrites=true&w=majority&appName=BackendDB"
  )
  .then(() => {
    console.log("Connected to database");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch(() => {
    const error = new Error("Something went wrong!");
    console.error("Connection failed:", error.message);
  });
