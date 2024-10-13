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
    ratings: [
      {
        userId: {
          //type: mongoose.Schema.Types.ObjectId,
          type: Number,
          required: false,
          //ref: "User",
        },
        rating: {
          type: Number,
          required: false,
          min: 1,
          max: 5,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", FileSchema);

module.exports = File;
