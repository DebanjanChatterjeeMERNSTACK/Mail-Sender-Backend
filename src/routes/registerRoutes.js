const express = require("express");
const route = express.Router();

const RegisterController = require("../controllers/registerControllers");

route.post("/register", RegisterController.register);
route.post("/login", RegisterController.login);

module.exports = route;
