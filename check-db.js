const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function checkDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Manga.countDocuments();
  console.log(`📊 Total manga: ${count}`);
  
  const sample = await Manga.findOne();
  if (sample) {
    console.log('📖 Contoh data:', sample.title, '- Chapter', sample.chapter);
  }
  process.exit(0);
}

checkDB();
