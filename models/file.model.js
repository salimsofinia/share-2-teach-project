const mongoose = require("mongoose");

const FileSchema = mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },

    fileUrl: {
      type: String,
      required: [true, "File url is required"],
    },

    Validation: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", FileSchema);

module.exports = File;
