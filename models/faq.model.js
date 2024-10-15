const mongoose = require("mongoose");

const FaqSchema = mongoose.Schema(
  {
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
