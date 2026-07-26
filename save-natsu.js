const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const natsuData = require('./natsu.json');

async function saveNatsu() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📊 Processing Natsu data...');
  
  const mangaList = [];
  
  natsuData.links.forEach(link => {
    if (link.href && link.href.includes('/manga/')) {
      const text = link.text || '';
      
      const chapterMatch = text.match(/Chapter:\s*(\d+(?:\.\d+)?)/i);
      const chapter = chapterMatch ? chapterMatch[1] : 'Unknown';
      
      const genreList = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
        'Harem', 'Martial Arts', 'Romance', 'Seinen', 'Shounen', 'Supernatural'];
      const genres = genreList.filter(g => text.includes(g));
      
      let title = text.replace(/Chapter:\s*\d+(?:\.\d+)?/i, '');
      for (const g of genreList) {
        title = title.replace(new RegExp(g, 'g'), '');
      }
      title = title.trim().substring(0, 100);
      
      if (title && title.length > 2) {
        mangaList.push({
          title: title,
          url: link.href,
          chapter: chapter,
          genre: genres.slice(0, 5),
          source: 'natsu',
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
      if (existing.chapter !== manga.chapter) {
        existing.chapter = manga.chapter;
        await existing.save();
        updated++;
      }
    } else {
      await Manga.create(manga);
      saved++;
      console.log('✅ New: ' + manga.title);
    }
  }
  
  console.log('📊 Natsu Summary:');
  console.log('✅ New: ' + saved);
  console.log('📝 Updated: ' + updated);
  console.log('📊 Total: ' + mangaList.length);
  process.exit(0);
}

saveNatsu();
