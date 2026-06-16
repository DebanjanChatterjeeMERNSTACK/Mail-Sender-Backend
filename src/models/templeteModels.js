const mongoose = require("mongoose");

const TempleteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
    },
    subjectMail: {
      type: String,
      require: [true, "email is require"],
    },
    bodyMail: {
      type: String,
      require: [true, "password is require"],
    },
    cvLink: {
      type: String,
      require: true,
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
const templeteschema = new mongoose.model("templete", TempleteSchema);

module.exports = templeteschema;
