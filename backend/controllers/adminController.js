const pool = require("../db/database");
const bcrypt = require("bcrypt");

const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const hashpassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (name , email , password , role) VALUES ($1 , $2 , $3 , $4)",
            [name, email, hashpassword, role]
        );

        if (result.rows.length > 0) {
            return res.json({
                message: "user already exists",
            });
        }

        res.status(200).json({
            message: "User added successfully",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const addStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        const result = await pool.query(
            "INSERT INTO stores (name , email , address , owner_id) VALUES ($1 , $2 , $3 , $4)",
            [name, email, address, owner_id]
        );

        if (result.rows.length > 0) {
            return res.json({
                message: "store already exists",
            });
        }

        res.status(200).json({
            message: "Store added successfully",
            store: result.rows[0]
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const getDashboard = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM stores) AS total_stores,
                (SELECT COUNT(*) FROM ratings) AS total_ratings
        `);

        res.status(200).json({
            message: "dashboard loaded successfully",
            dashboard: result.rows[0]
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");

        if (result.rows.length === 0) {
            return res.status(200).json({
                message: "users not found",
                users: []
            });
        }

        res.status(200).json({
            message: "Users fetched successfully",
            users: result.rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const getStores = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM stores");
        if (result.rows.length === 0) {
            return res.status(200).json({
                message: "stores not found",
                stores: []
            });
        }

        res.status(200).json({
            message: "Stores fetched successfully",
            stores: result.rows
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT id , name , email , role
      FROM users
      WHERE id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: result.rows[0]
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

module.exports = { addUser, addStore, getDashboard, getUsers, getStores, getUserDetails };
