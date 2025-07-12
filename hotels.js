const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const db = require('../db');
router.get('/hotels', (req, res) => {
  let destination = req.query.destination;

  if (!destination) {
    return res.status(400).json({ error: "Destination is required" });
  }

  // Normalize input
  destination = destination.trim();

  const isNumericId = !isNaN(destination);

  let sql;
  let params;

  if (isNumericId) {
    // destination is ID
    sql = `
      SELECT h.id, h.name, h.location, h.price, h.photo, h.destination_id, d.name AS destination_name 
      FROM hotels h 
      INNER JOIN destinations d ON h.destination_id = d.id
      WHERE h.destination_id = ?`;
    params = [destination];
  } else {
    // destination is name (case-insensitive match)
    sql = `
      SELECT h.id, h.name, h.location, h.price, h.photo, h.destination_id, d.name AS destination_name 
      FROM hotels h 
      INNER JOIN destinations d ON h.destination_id = d.id
      WHERE LOWER(d.name) = ?`;
    params = [destination.toLowerCase()];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed", details: err.message });
    }
    res.json(results);
  });
});



// ADD new hotel
router.post('/hotels', (req, res) => {
  const { name, location, price, photo, destination_id } = req.body;

  if (!name || !location || !price || !photo || !destination_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Ensure the photo is not base64 but a valid URL
  if (photo.startsWith("data:image")) {
    return res.status(400).json({ error: "Base64 images are not allowed, upload an image URL instead!" });
  }

  let sql = `INSERT INTO hotels (name, location, price, photo, destination_id)
               VALUES (?, ?, ?, ?, ?)`;
  
  db.query(sql, [name, location, price, photo, destination_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add hotel" });
    }
    res.status(201).json({ message: "Hotel added", hotelId: result.insertId });
  });
});
const storage = multer.diskStorage({
    destination: './uploads/', // Ensure 'uploads' folder exists
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File upload failed" });
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
// UPDATE hotel
router.put('/hotels/:id', (req, res) => {
  const id = req.params.id;
  const { name, location, price, photo, destination_id } = req.body;
  const sql = `UPDATE hotels SET name=?, location=?, price=?, photo=?, destination_id=? WHERE id=?`;
  db.query(sql, [name, location, price, photo, destination_id, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update hotel" });
    }
    res.json({ message: "Hotel updated" });
  });
});

// DELETE hotel
router.delete('/hotels/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM hotels WHERE id=?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete hotel" });
    }
    res.json({ message: "Hotel deleted" });
  });
});

module.exports = router;
