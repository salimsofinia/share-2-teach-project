const mongoose = require("mongoose");

const ModhistorySchema = mongoose.Schema(
  {
    moderator: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    oldValidation: {
      type: Boolean,
      required: true,
    },

    oldComments: {
      type: String,
      required: false,
    },

    newValidation: {
      type: Boolean,
      required: true,
    },

    newComments: {
      type: String,
      required: false,
    },
  },

  {
    timestamps: true,
  }
);

const Modhistory = mongoose.model("Modhistory", ModhistorySchema);

module.exports = Modhistory;
