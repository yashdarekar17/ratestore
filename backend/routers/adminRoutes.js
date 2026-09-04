const express = require("express");
const route = express.Router();
const {addUser, addStore ,getDashboard , getUsers , getStores , getUserDetails} = require("../controllers/adminController");

route.post("/addstore", addStore);
route.get("/getdashboard", getDashboard);
route.get("/getusers", getUsers);
route.get("/getstores", getStores);
route.get("/getuserdetails/:id", getUserDetails);
route.post("/adduser", addUser);

module.exports = route;