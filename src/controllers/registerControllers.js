const Register = require("../models/registerModels");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, password, appPassword, email } = req.body;

    if (!name && !email && !password && !appPassword) {
      return res
        .status(400)
        .send({ message: "Information Uncomplete", success: false });
    }

    const existMail = await Register.findOne({ email: email });
    if (existMail) {
      return res
        .status(400)
        .send({ message: "Mail Allready Register", success: false });
    }

    const hassPassword = await bcrypt.hash(password, 10);

    const data = await Register({
      name,
      email,
      password: hassPassword,
      appPassword,
    });
    data.save();
    res.status(200).send({ message: "Register Successful", success: true });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Information Uncomplete", success: false });
    }

    const data = await Register.findOne({ email });

    if (!data) {
      return res
        .status(400)
        .send({ message: "Invalid Details", success: false });
    }

    const match = await bcrypt.compare(password, data.password);

    if (!match) {
      return res
        .status(400)
        .send({ message: "Email & Password Are Unmatch", success: false });
    }

    // Generate JWT
    jwt.sign(
      { name: data.name, id: data._id, role: data.role },
      process.env.JWTKEY,
      { expiresIn: "7d" },
      (err, token) => {
        if (error) {
          return res
            .status(400)
            .send({ message: error.message, success: false });
        }

        return res
          .status(200)
          .send({ message: "Login Successfull", success: true, token });
      },
    );
  } catch (err) {
    res.status(400).send({ message: error.message, success: false });
  }
};

module.exports = { register, login };
