const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure you have db connection set up

// POST route to save a booking
router.post('/book', (req, res) => {
  const { destination, name, email } = req.body;

  if (!destination || !name || !email) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO destination_bookings (destination, name, email) VALUES (?, ?, ?)';
  db.query(sql, [destination, name, email], (err, result) => {
    if (err) {
      console.error('Error inserting booking:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Booking successful!' });
  });
});
router.get('/bookeddestinations', (req, res) => {
  const sql = 'SELECT DISTINCT destination, name, email FROM destination_bookings';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

module.exports = router;
