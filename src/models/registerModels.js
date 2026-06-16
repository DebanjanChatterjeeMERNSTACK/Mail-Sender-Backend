const mongoose = require("mongoose");

const RegisterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      require: [true, "email is require"],
    },
    password: {
      type: String,
      require: [true, "password is require"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    emailCollection: {
      type: Array,
    },
    appPasword: {
      type: String,
      require: [true, "app password is require"],
    },
    Date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  },
);
const registerschema = new mongoose.model("register", RegisterSchema);

module.exports = registerschema;
