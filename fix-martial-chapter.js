const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function fixMartial() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Update Martial Peak
  const result = await Manga.updateOne(
    { title: 'Martial Peak' },
    { chapter: '3910' }
  );
  
  console.log('✅ Martial Peak chapter updated to 3910');
  
  // Cek hasil
  const manga = await Manga.findOne({ title: 'Martial Peak' });
  console.log('📖 Title:', manga.title);
  console.log('📝 Chapter:', manga.chapter);
  console.log('⭐ Rating:', manga.rating);
  
  process.exit(0);
}

fixMartial();
