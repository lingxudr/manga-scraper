const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function checkMartial() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Cari Martial Peak
  const manga = await Manga.findOne({ title: { $regex: /Martial Peak/i } });
  
  if (manga) {
    console.log('📖 Found:', manga.title);
    console.log('📝 Chapter:', manga.chapter);
    console.log('🔗 URL:', manga.url);
    console.log('📂 Source:', manga.source);
    console.log('📋 Full data:', JSON.stringify(manga, null, 2));
  } else {
    console.log('❌ Martial Peak not found');
    
    // Tampilkan 5 data pertama
    const all = await Manga.find().limit(5);
    console.log('\n📖 5 data pertama:');
    all.forEach((m, i) => {
      console.log((i+1) + '. ' + m.title + ' - Chapter ' + m.chapter);
    });
  }
  
  process.exit(0);
}

checkMartial();
