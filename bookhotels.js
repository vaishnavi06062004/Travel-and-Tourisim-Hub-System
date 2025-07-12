const express = require('express');
const router = express.Router();
const db = require('../db'); // Your MySQL connection

router.post('/bookhotels', (req, res) => {
  const {
    hotelName, hotelLocation, hotelPrice, hotelImage,
    name, email, phone, checkIn, checkOut
  } = req.body;

  const sql = `
    INSERT INTO hotel_bookings 
    (hotelName, hotelLocation, hotelPrice, hotelImage, name, email, phone, checkIn, checkOut) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [hotelName, hotelLocation, hotelPrice, hotelImage, name, email, phone, checkIn, checkOut], (err, result) => {
    if (err) {
      console.error("Error inserting hotel booking:", err);
      return res.status(500).json({ error: "Failed to book hotel" });
    }
    res.status(200).json({ message: "Hotel booking successful!" });
  });
});

module.exports = router;
