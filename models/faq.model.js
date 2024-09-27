const mongoose = require("mongoose");

const FaqSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Name is required"],
    },

    lastname: {
      type: String,
      required: true,
      default: 0,
    },

    question: {
      type: String,
      required: true,
      default: 0,
    },

    answer: {
      type: String,
      required: true,
    },

  },
  {
    timestamps: true,
  }
);

const Faq = mongoose.model("Faq", FaqSchema);

module.exports = Faq;