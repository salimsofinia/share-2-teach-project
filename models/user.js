const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: [true, "First name cannot be blank"] },
  lastname: { type: String, required: [true, "Last name cannot be blank"] },
  email: {
    type: String,
    required: [true, "Email address cannot be blank"],
    unique: true,
  },
  affiliation: {
    type: String,
    required: false,
  },
  credential: { type: String, required: false },
  role: { type: String, required: [true, "Role cannot be blank"] },
  password: { type: String, required: [true, "Password cannot be blank"] },
});

userSchema.statics.findAndValidate = async function (email, password) {
  const foundUser = await this.findOne({ email });
  if (!foundUser) {
    console.log("User not found for email:", email);
    return false;
  }
  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
