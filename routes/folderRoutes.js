const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

router.use(auth);

// Create a new folder
router.post('/', async (req, res) => {
  try {
    const folder = new Folder({ ...req.body, user: req.userId });
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all folders for a user
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.userId });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a folder
router.put('/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(folder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a folder
router.delete('/:id', async (req, res) => {
  try {
    await Folder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;