const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function fixChapters() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Cari semua manga dengan chapter Unknown
  const mangaList = await Manga.find({ chapter: 'Unknown' });
  console.log('📊 Manga dengan chapter Unknown:', mangaList.length);
  
  let fixed = 0;
  
  for (const manga of mangaList) {
    // Coba ambil chapter dari title (jika ada angka)
    const title = manga.title || '';
    const chapterMatch = title.match(/\d+(?:\.\d+)?/);
    
    if (chapterMatch) {
      manga.chapter = chapterMatch[0];
      await manga.save();
      fixed++;
      console.log('✅ ' + manga.title + ' → Chapter ' + chapterMatch[0]);
    }
  }
  
  console.log('📊 Fixed ' + fixed + ' manga chapters');
  process.exit(0);
}

fixChapters();
