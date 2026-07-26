const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const { scrapeChaptersForManga } = require('./scrape-chapters-v4');

async function fixFailed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Cari manga tanpa chapters
  const failed = await Manga.findOne({ 
    $or: [
      { chapters: { $exists: false } },
      { chapters: { $size: 0 } }
    ]
  });
  
  if (failed) {
    console.log(`🔧 Memperbaiki: ${failed.title}`);
    const count = await scrapeChaptersForManga(failed);
    console.log(`✅ ${count} chapters ditambahkan`);
  } else {
    console.log('✅ Semua manga sudah punya chapters!');
  }
  
  process.exit(0);
}

fixFailed();
