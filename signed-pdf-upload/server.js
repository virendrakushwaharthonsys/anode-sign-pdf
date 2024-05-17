const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3008;

app.use(cors()); // Enable CORS for all routes

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('signedPdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({ url: `http://localhost:3008/uploads/${req.file.filename}` });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
