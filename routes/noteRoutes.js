const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const { upload, uploadToGCS } = require('../utils/fileUpload');

router.use(auth);

// Create a new note
router.post('/', async (req, res) => {
  try {
    const { heading, content, folder } = req.body;
    const note = new Note({
      heading,
      content,
      folder,
      user: req.userId
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all notes in a folder
router.get('/folder/:folderId', async (req, res) => {
  try {
    const notes = await Note.find({ folder: req.params.folderId, user: req.userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const { heading, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { heading, content },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload media and add to note content
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  console.log('Upload request received');
  console.log('Note ID:', req.params.id);
  console.log('User ID:', req.userId);
  console.log('File:', req.file);
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) {
      console.log('Note not found');
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploading file to GCS');
    const result = await uploadToGCS(req.file);
    console.log('File uploaded successfully:', result);
    
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    
    // Add the new media item to the note's content
    note.content.push({
      type: mediaType,
      content: result.url,
      publicId: result.publicId
    });

    console.log('Saving updated note');
    await note.save();
    console.log('Note saved successfully');
    res.json(note);
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;