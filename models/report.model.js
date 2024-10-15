const mongoose = require("mongoose");

const ReportSchema = mongoose.Schema(
  {
    file: {
      type: String,
      required: [true, "Name is required"],
    },

    reason: {
      type: String,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
