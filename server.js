const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const Manga = require('./models/Manga');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Koneksi database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ============ ENDPOINTS ============

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// GET /api/manga - Daftar semua manga
app.get('/api/manga', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'rating' } = req.query;
    const sortOptions = {
      rating: { rating: -1 },
      latest: { lastUpdate: -1 },
      title: { title: 1 }
    };
    const manga = await Manga.find()
      .sort(sortOptions[sort] || { rating: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Manga.countDocuments();
    res.json({
      success: true,
      data: manga,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/manga/:id - Detail manga
app.get('/api/manga/:id', async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    if (!manga) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: manga });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/search - Cari manga
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'q required' });
    const results = await Manga.find({ title: { $regex: q, $options: 'i' } }).limit(20);
    res.json({ success: true, query: q, total: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/genres - Daftar genre
app.get('/api/genres', async (req, res) => {
  try {
    const genres = await Manga.distinct('genre');
    res.json({ success: true, genres: genres.filter(g => g) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
