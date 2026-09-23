const express = require("express");
const route = express.Router();

const RegisterController = require("../controllers/registerControllers");

route.post("/register", RegisterController.register);
route.post("/login", RegisterController.login);
route.post("/forget-password", RegisterController.forgotPassword);
route.post("/reset-password/:token", RegisterController.resetPassword);

module.exports = route;
