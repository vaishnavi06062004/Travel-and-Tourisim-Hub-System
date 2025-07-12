const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: './uploads/', // Ensure this folder exists
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// Upload API route
router.post('/api/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Image upload failed—file missing!" });
    }

    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;
