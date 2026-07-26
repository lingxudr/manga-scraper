const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const kiryuuData = require('./kiryuu.json');

async function saveKiryuu() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📊 Processing Kiryuu data...');
  
  const mangaList = [];
  
  kiryuuData.links.forEach(link => {
    // Cari link yang mengarah ke manga
    if (link.href && link.href.includes('/manga/')) {
      const text = link.text || '';
      
      // Ambil chapter dari text
      const chapterMatch = text.match(/Chapter\s*(\d+(?:\.\d+)?)/i);
      const chapter = chapterMatch ? chapterMatch[1] : 'Unknown';
      
      // Ambil rating
      const ratingMatch = text.match(/(\d+\.\d+)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
      
      // Ambil genre
      const genreList = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
        'Harem', 'Martial Arts', 'Romance', 'Seinen', 'Shounen', 'Supernatural',
        'Sci-fi', 'Historical', 'Wuxia', 'Mystery', 'Horror'];
      const genres = genreList.filter(g => text.includes(g));
      
      // Deteksi type
      let type = 'Manga';
      if (text.includes('Manhua')) type = 'Manhua';
      else if (text.includes('Manhwa')) type = 'Manhwa';
      
      // Clean title
      let title = text.replace(/Chapter\s*\d+(?:\.\d+)?/i, '');
      title = title.replace(/Manhua|Manhwa|Manga|Color|Hot|🔥/g, '');
      title = title.replace(/\d+\.\d+/, ''); // hapus rating
      title = title.trim().substring(0, 100);
      
      if (title && title.length > 2 && !title.match(/^Ch\./i)) {
        mangaList.push({
          title: title,
          url: link.href,
          poster: '',
          chapter: chapter,
          rating: rating,
          genre: genres.slice(0, 5),
          type: type,
          source: 'kiryuu',
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
  
  console.log('📊 Kiryuu Summary:');
  console.log('✅ New: ' + saved);
  console.log('📝 Updated: ' + updated);
  console.log('📊 Total: ' + mangaList.length);
  process.exit(0);
}

saveKiryuu();
