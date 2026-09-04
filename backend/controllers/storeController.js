const pool = require("../db/database");

const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;
        const result = await pool.query(
            `INSERT INTO stores (name, email, address, owner_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, email, address, Number(owner_id)]
        );

        await pool.query(
            `UPDATE users SET role = 'OWNER' WHERE id = $1`,
            [Number(owner_id)]
        );

        res.status(200).json({
            message: "store added successfully",
            store: result.rows[0]
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const getStores = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.id, s.name, s.email, s.address, s.owner_id, 
                   u.name AS owner_name, u.email AS owner_email,
                   COALESCE(AVG(r.rating), 0)::numeric(10,1) AS average_rating,
                   COUNT(r.id)::int AS total_ratings
            FROM stores s
            LEFT JOIN users u ON s.owner_id = u.id
            LEFT JOIN ratings r ON s.id = r.store_id
            GROUP BY s.id, u.name, u.email
            ORDER BY s.id DESC
        `);
        res.status(200).json({
            message: "Stores fetched successfully",
            stores: result.rows
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT s.id, s.name, s.email, s.address, s.owner_id, u.name AS owner_name, u.email AS owner_email
             FROM stores s
             LEFT JOIN users u ON s.owner_id = u.id
             WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        res.status(200).json({
            message: "Store details fetched successfully",
            store: result.rows[0]
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

module.exports = { createStore, getStores, getStoreById };
