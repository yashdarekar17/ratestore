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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        
        const result = await pool.query(
            "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
            [email.trim()]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch {
            isMatch = false;
        }

        if (!isMatch && password !== user.password) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: (user.role || "USER").toUpperCase()
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                message: "Email and new password are required"
            });
        }

        const hashpassword = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            "UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2) RETURNING id, name, email, role",
            [hashpassword, email.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (err) {
        console.error("Update password error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    login,
    signup,
    updatePassword
};