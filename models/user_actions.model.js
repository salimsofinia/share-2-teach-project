const mongoose = require("mongoose");

const UserActionSchema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserAction = mongoose.model("UserAction", UserActionSchema);

module.exports = UserAction;
