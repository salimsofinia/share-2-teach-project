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
      required: true,
      default: false,
    },
    //comments from file moderation
    comments: {
      type: String,
      required: false,
      default: "File not yet validated",
    },
    //metadata follows
    fileSize: {
      type: Number,
      required: false,
    },
    fileType: {
      type: String,
      required: false,
    },
    //JWT perchance
    uploadUser: {
      type: String,
      required: false,
    },
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    ratings: {
      type: [Number],
      require: false,
      min: 0,
      max: 5,
    },
    /*
    ratings: [
      {
        type: Number,
        required: false,
        min: 0,
        max: 5,
      },
    ],*/
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", FileSchema);

module.exports = File;
