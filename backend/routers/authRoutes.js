const express = require("express");
const route = express.Router();
const {signup , login, updatePassword} = require("../controllers/authController.js");

route.post("/signup" , signup);
route.post("/login" , login);
route.post("/update-password", updatePassword);

module.exports = route;