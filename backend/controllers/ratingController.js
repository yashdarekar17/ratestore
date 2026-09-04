const pool = require("../db/database");

const submitOrUpdateRating = async (req, res) => {
    try {
        const { user_id, store_id, rating } = req.body;

        if (!user_id || !store_id || !rating) {
            return res.status(400).json({
                message: "user_id, store_id, and rating are required"
            });
        }

        const numericUserId = Number(user_id);
        const numericStoreId = Number(store_id);
        const numericRating = Number(rating);

        if (isNaN(numericUserId) || isNaN(numericStoreId)) {
            return res.status(400).json({
                message: "user_id and store_id must be valid numbers"
            });
        }

        if (numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const result = await pool.query(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, store_id)
             DO UPDATE SET
                rating = EXCLUDED.rating,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [numericUserId, numericStoreId, numericRating]
        );

        res.status(200).json({
            message: "rating submitted successfully",
            rating: result.rows[0]
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

const getRatings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.id, r.user_id, r.store_id, r.rating, r.created_at, r.updated_at,
                   u.name AS user_name, u.email AS user_email
            FROM ratings r
            JOIN users u ON u.id = r.user_id
            ORDER BY r.created_at DESC
        `);

        res.status(200).json({
            message: "ratings fetched successfully",
            ratings: result.rows
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
};

module.exports = { submitOrUpdateRating, getRatings };