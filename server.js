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

// Koneksi ke database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ============ ENDPOINT API ============

// 1. GET /api/manga - Daftar semua manga
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

// 2. GET /api/manga/:id - Detail manga
app.get('/api/manga/:id', async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    if (!manga) {
      return res.status(404).json({ success: false, error: 'Manga not found' });
    }
    res.json({ success: true, data: manga });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/search - Cari manga
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" required' });
    }
    
    const results = await Manga.find({
      title: { $regex: q, $options: 'i' }
    }).limit(20);
    
    res.json({
      success: true,
      query: q,
      total: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET /api/genres - Daftar genre
app.get('/api/genres', async (req, res) => {
  try {
    const genres = await Manga.distinct('genre');
    res.json({ success: true, genres: genres.filter(g => g) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /health - Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    totalManga: 116,
    timestamp: new Date().toISOString()
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log(`📊 Total manga: 116`);
  console.log('\n📖 Endpoints:');
  console.log('  GET /api/manga');
  console.log('  GET /api/manga/:id');
  console.log('  GET /api/search?q=');
  console.log('  GET /api/genres');
  console.log('  GET /health');
});
