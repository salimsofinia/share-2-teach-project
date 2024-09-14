const mongoose = require("mongoose");

const ClientSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Client name is required"],
    },

    lastname: {
      type: String,
      required: true,
      default: 0,
    },

    email: {
      type: String,
      required: true,
      default: 0,
    },

    role: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model("Client", ClientSchema);

module.exports = Client;
