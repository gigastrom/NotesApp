const mongoose = require('mongoose');

const ContentItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'image', 'video'], required: true },
  content: { type: String, required: true }, // Text content or media URL
  publicId: { type: String } // Only for media items
}, { _id: false });

const NoteSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  content: [ContentItemSchema],
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);