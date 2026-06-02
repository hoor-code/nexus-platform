const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filePath: { type: String, required: true }, // Local path string pointing to where the file is stored
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'signed'], 
    default: 'pending' 
  },
  signatureData: { type: String, default: '' } // Base64 string image representation of the electronic signature capture
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);