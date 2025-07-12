const express = require('express');
const router = express.Router();
const db = require('../db');  // correct import of shared DB
router.get('/', (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching customers' });
    }
    res.json(results);
  });
});

// CREATE customer
router.post('/', (req, res) => {
  const { name, email, phone, gender } = req.body;

  // Check if email already exists
  db.query('SELECT * FROM customers WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists. Use a different email.' });
    }

    // Insert if not exists
    const sql = 'INSERT INTO customers (name, email, phone, gender) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, phone, gender], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error inserting customer' });
    res.json({ 
  message: "Customer added successfully", 
  customer: { id: result.insertId, name, email, phone, gender } 
});

    });
  });
});
router.get("/", (req, res) => {
  const sql = "SELECT id, name, email, phone, gender FROM customers";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching customers:", err);
      return res.status(500).json({ message: "Failed to fetch customers" });
    }
    res.json(result); // ✅ Must include 'id'
  });
});
// GET single customer by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM customers WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching customer" });
    res.json(result[0]); // Return the single customer
  });
});

// PUT update customer
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { name, email, phone, gender } = req.body;
  const sql = "UPDATE customers SET name = ?, email = ?, phone = ?, gender = ? WHERE id = ?";
  db.query(sql, [name, email, phone, gender, id], (err) => {
    if (err) return res.status(500).json({ message: "Error updating customer" });
    res.json({ message: "Customer updated successfully" });
  });
});

// DELETE customer
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM customers WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Error deleting customer" });
    res.json({ message: "Customer deleted successfully" });
  });
});

module.exports = router;
