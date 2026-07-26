console.log("🔥 BUILD TEST 26-07-2026");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cron = require('node-cron');
require('dotenv').config();

const Manga = require('./models/Manga');
const scrapeNatsu = require('./scraper-natsu');
const { sendUpdateReport } = require('./notify');

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

// ============ SCHEDULER ============
async function autoUpdate() {
  console.log(`🔄 [${new Date().toISOString()}] Auto update...`);
  try {
    const data = await scrapeNatsu();
    let newCount = 0, updateCount = 0;
    for (const item of data) {
      const existing = await Manga.findOne({ url: item.url });
      if (existing) {
        if (existing.chapter !== item.chapter) {
          existing.chapter = item.chapter;
          existing.lastUpdate = new Date();
          await existing.save();
          updateCount++;
        }
      } else {
        await Manga.create(item);
        newCount++;
      }
    }
    const total = await Manga.countDocuments();
    console.log(`✅ New: ${newCount}, Updated: ${updateCount}, Total: ${total}`);
    if (newCount > 0 || updateCount > 0) {
      await sendUpdateReport(newCount, updateCount, total);
    }
  } catch (error) {
    console.error('❌ Auto update error:', error.message);
  }
}

// Jadwal setiap 1 jam
cron.schedule('0 */1 * * *', autoUpdate);
console.log('⏰ Scheduler running! Auto update every 1 hour');

// Jalankan sekali saat startup
setTimeout(autoUpdate, 5000);

// ============ ENDPOINTS ============

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

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

app.get('/api/manga/:id', async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);
    if (!manga) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: manga });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

app.get('/api/genres', async (req, res) => {
  try {
    const genres = await Manga.distinct('genre');
    res.json({ success: true, genres: genres.filter(g => g) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${PORT}`);
});
