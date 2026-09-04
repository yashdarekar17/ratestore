const pool = require("../db/database");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        // Check if user already exists
        const existing = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
            [email.trim()]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
            [name.trim(), email.trim(), hashpassword, "USER"]
        );

        res.status(200).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
      
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        
        // Find user by email and role
        const result = await pool.query(
            "SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND LOWER(role) = LOWER($2)",
            [email.trim(), role || "USER"]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found with this email and role"
            });
        }

        const user = result.rows[0];

        // Support both bcrypt hashed password and plain text (in case entered directly in DB)
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch {
            isMatch = false;
        }

        if (!isMatch && password !== user.password) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // Return user with role so frontend can navigate to the correct dashboard
        res.status(200).json({
            message: "Login successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || "USER"
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    login,
    signup
};