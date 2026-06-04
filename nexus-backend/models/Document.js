const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filePath: { type: String, required: true }, 
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
  signatureData: { type: String, default: '' } 
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);