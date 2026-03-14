const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  beforeImage: { type: String, required: true },
  afterImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', GallerySchema);
