const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const Document = require('../models/Document');

// Configure local disk storage space for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be saved into an 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generates a completely unique file name using timestamps
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter to ensure only PDF documents are allowed
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// @route   POST api/documents/upload
// @desc    Upload a contract or business pitch PDF
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file format invalid.' });
    }

    const newDoc = new Document({
      title: req.body.title || req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.user.id
    });

    const doc = await newDoc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error during upload');
  }
});

// @route   GET api/documents
// @desc    Fetch all files accessible to the user
router.get('/', auth, async (req, res) => {
  try {
    const docs = await Document.find()
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).send('Server Error fetching files');
  }
});

// @route   PUT api/documents/sign/:id
// @desc    E-Sign an active document contract
router.put('/sign/:id', auth, async (req, res) => {
  try {
    let doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    doc.signatureData = req.body.signatureData; // Receives base64 canvas signature drawing
    doc.status = 'signed';

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).send('Server Error signing document');
  }
});

module.exports = router;