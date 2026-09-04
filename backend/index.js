const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const pool = require("./db/database");

app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));

pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    }
    else {
        console.log("Database connected successfully");
    }
})

const authRoutes = require("./routers/authRoutes");
const adminRoutes = require("./routers/adminRoutes");
const storeRoutes = require("./routers/storeRoutes");
const ratingRoutes = require("./routers/ratingRoutes");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/stores", storeRoutes);
app.use("/ratings", ratingRoutes);


app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});
