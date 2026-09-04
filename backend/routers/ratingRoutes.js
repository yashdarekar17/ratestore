const express = require("express");
const route = express.Router();
const {submitOrUpdateRating, getRatings} = require("../controllers/ratingController");

route.post("/submitrating", submitOrUpdateRating);
route.get("/getratings", getRatings);

module.exports = route;