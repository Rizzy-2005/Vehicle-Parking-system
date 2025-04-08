const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/kochi-users', (req, res) => {
    const query = `
      SELECT user_id, user_name, phone_no, gender
      FROM users
      WHERE user_id IN (
        SELECT DISTINCT user_id
        FROM parking_record
        WHERE branch_name = ?
      )
    `;
    db.query(query, ['Kochi Central'], (err, results) => {
      if (err) {
        console.error("Error fetching Kochi users:", err);
        res.status(500).send("DB error");
      } else {
        res.json(results);
      }
    });
  });

  return router;
};
