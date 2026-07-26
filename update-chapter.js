const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function updateChapters() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Cari manga yang chapter-nya Unknown
  const manga = await Manga.find({ chapter: 'Unknown' });
  console.log(`📊 Manga dengan chapter Unknown: ${manga.length}`);
  
  // Tampilkan 5 contoh
  manga.slice(0, 5).forEach(m => {
    console.log(`  - ${m.title}`);
  });
  
  process.exit(0);
}

updateChapters();
