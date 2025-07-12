const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {   // changed from /destinations to / for mounting at /api/destinations
  db.query("SELECT * FROM destinations", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  console.log("POST /api/destinations called");
  console.log("Body:", req.body);

  const { name, location, price, category, image } = req.body;
  if (!name || !location || !price || !category || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const sql = "INSERT INTO destinations (name, location, price, category, image) VALUES (?, ?, ?, ?, ?)";
  const values = [name, location, price, category, image];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("DB Insert Error:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ message: "Destination added", id: result.insertId });
  });
});

router.delete("/:id", (req, res) => {
  console.log("Deleting destination id:", req.params.id);
  const sql = "DELETE FROM destinations WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Failed to delete" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.json({ message: "Destination deleted" });
  });
});

router.put("/:id", (req, res) => {
  const { name, location, price, category, image } = req.body;
  const sql = "UPDATE destinations SET name = ?, location = ?, price = ?, category = ?, image = ? WHERE id = ?";
  const values = [name, location, price, category, image, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("DB Update Error:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.json({ message: "Destination updated" });
  });
});

module.exports = router;
