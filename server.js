const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Path to data files
const FAVORITES_FILE = path.join(__dirname, 'data', 'favorites.json');
const BOOKMARKED_FILE = path.join(__dirname, 'data', 'bookmarked.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Create favorites file if it doesn't exist
if (!fs.existsSync(FAVORITES_FILE)) {
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify([]));
}

// Create bookmarked file if it doesn't exist
if (!fs.existsSync(BOOKMARKED_FILE)) {
  fs.writeFileSync(BOOKMARKED_FILE, JSON.stringify([]));
}

// Favorites endpoints
app.get('/favorites', (req, res) => {
  try {
    const favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8'));
    res.json(favorites);
  } catch (error) {
    console.error('Error reading favorites:', error);
    res.status(500).json({ error: 'Failed to read favorites' });
  }
});

app.post('/favorites', (req, res) => {
  try {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Favorites updated successfully' });
  } catch (error) {
    console.error('Error saving favorites:', error);
    res.status(500).json({ error: 'Failed to save favorites' });
  }
});

// Bookmarked recipes endpoints
app.get('/bookmarked', (req, res) => {
  try {
    if (!fs.existsSync(BOOKMARKED_FILE)) {
      fs.writeFileSync(BOOKMARKED_FILE, JSON.stringify([]));
      res.json([]);
      return;
    }
    
    const bookmarked = JSON.parse(fs.readFileSync(BOOKMARKED_FILE, 'utf8'));
    res.json(bookmarked);
  } catch (error) {
    console.error('Error reading bookmarked recipes:', error);
    res.status(500).json({ error: 'Failed to read bookmarked recipes' });
  }
});

app.post('/bookmarked', (req, res) => {
  try {
    fs.writeFileSync(BOOKMARKED_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Bookmarked recipes updated successfully' });
  } catch (error) {
    console.error('Error saving bookmarked recipes:', error);
    res.status(500).json({ error: 'Failed to save bookmarked recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});