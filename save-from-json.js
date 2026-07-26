const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const natsuData = require('./scrape_result_natsu.one_1785061471920.json');

async function saveFromJSON() {
  await mongoose.connect(process.env.MONGODB_URI);
  
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
          title,
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
  for (const manga of mangaList) {
    const existing = await Manga.findOne({ url: manga.url });
    if (!existing) {
      await Manga.create(manga);
      saved++;
      console.log('✅ ' + manga.title);
    }
  }
  
  console.log('📊 Saved ' + saved + ' new manga from JSON');
  process.exit(0);
}

saveFromJSON();
