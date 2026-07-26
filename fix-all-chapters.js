const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function fixAllChapters() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const mangaList = await Manga.find({});
  console.log('📊 Total manga:', mangaList.length);
  
  let fixed = 0;
  
  for (const manga of mangaList) {
    let newChapter = null;
    
    // Skip kalo udah ada chapter yang jelas
    if (manga.chapter !== 'Unknown' && manga.chapter && !isNaN(manga.chapter)) {
      continue;
    }
    
    // 1. Coba dari title (cari angka)
    const titleMatch = manga.title.match(/(\d+(?:\.\d+)?)/);
    if (titleMatch) {
      newChapter = titleMatch[1];
    }
    
    // 2. Coba dari source manhwaindo (ada rating di title)
    if (!newChapter && manga.source === 'manhwaindo') {
      const textMatch = manga.title.match(/Chapter\s*(\d+(?:\.\d+)?)/i);
      if (textMatch) {
        newChapter = textMatch[1];
      }
    }
    
    // 3. Coba dari url
    if (!newChapter && manga.url) {
      const urlMatch = manga.url.match(/\/(\d+)\/?$/);
      if (urlMatch) {
        newChapter = urlMatch[1];
      }
    }
    
    if (newChapter) {
      manga.chapter = newChapter;
      await manga.save();
      fixed++;
      console.log('✅ ' + manga.title.substring(0, 30) + ' → Chapter ' + newChapter);
    }
  }
  
  console.log('📊 Fixed ' + fixed + ' manga chapters');
  process.exit(0);
}

fixAllChapters();
