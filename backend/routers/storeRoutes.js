const express = require("express");
const route = express.Router();
const {createStore , getStores , getStoreById} = require("../controllers/storeController");

route.post("/create", createStore);
route.get("/getstores", getStores);
route.get("/getstorebyid/:id", getStoreById);

module.exports = route;