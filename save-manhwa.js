const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const manhwaData = require('./manhwaindo.json');

async function saveManhwa() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📊 Processing Manhwaindo data...');
  
  const mangaList = [];
  
  manhwaData.links.forEach(link => {
    if (link.href && link.href.includes('/series/')) {
      const text = link.text || '';
      
      const chapterMatch = text.match(/Chapter\s*(\d+(?:\.\d+)?)/i);
      const chapter = chapterMatch ? chapterMatch[1] : 'Unknown';
      
      const ratingMatch = text.match(/(\d+\.?\d*)\s*$/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
      
      let type = 'Manga';
      if (text.includes('Manhua')) type = 'Manhua';
      else if (text.includes('Manhwa')) type = 'Manhwa';
      
      let title = text.replace(/Chapter\s*\d+(?:\.\d+)?/i, '');
      title = title.replace(/Manhua|Manhwa|Manga|Color|Hot/g, '');
      title = title.trim().substring(0, 100);
      
      if (title && title.length > 2) {
        mangaList.push({
          title: title,
          url: link.href,
          chapter: chapter,
          rating: rating,
          type: type,
          source: 'manhwaindo',
          lastUpdate: new Date()
        });
      }
    }
  });
  
  let saved = 0;
  let updated = 0;
  
  for (const manga of mangaList) {
    const existing = await Manga.findOne({ url: manga.url });
    if (existing) {
      if (existing.chapter !== manga.chapter || existing.rating !== manga.rating) {
        existing.chapter = manga.chapter;
        existing.rating = manga.rating;
        await existing.save();
        updated++;
      }
    } else {
      await Manga.create(manga);
      saved++;
      console.log('✅ New: ' + manga.title);
    }
  }
  
  console.log('📊 Manhwaindo Summary:');
  console.log('✅ New: ' + saved);
  console.log('📝 Updated: ' + updated);
  console.log('📊 Total: ' + mangaList.length);
  process.exit(0);
}

saveManhwa();
