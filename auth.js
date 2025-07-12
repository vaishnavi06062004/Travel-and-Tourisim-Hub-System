// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, password], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'User registered successfully' });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      res.send({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
