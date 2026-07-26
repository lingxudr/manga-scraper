const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function cleanManhwaData() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Cari semua data dari manhwaindo
  const manhwaData = await Manga.find({ source: 'manhwaindo' });
  console.log('📊 Data Manhwaindo ditemukan:', manhwaData.length);
  
  let cleaned = 0;
  
  for (const manga of manhwaData) {
    let title = manga.title || '';
    let chapter = manga.chapter || 'Unknown';
    let rating = manga.rating || null;
    
    // 1. CLEAN TITLE - hapus tag HTML
    title = title.replace(/<[^>]*>/g, '').trim();
    title = title.replace(/Manhua|Manhwa|Manga|Color|Hot/g, '').trim();
    title = title.replace(/\s+/g, ' ').trim();
    
    // 2. FIX CHAPTER & RATING - pisahkan angka
    // Contoh: "8868.5" → chapter: "886", rating: 8.5
    if (chapter && typeof chapter === 'string') {
      const match = chapter.match(/^(\d+)(\d\.\d+)$/);
      if (match) {
        chapter = match[1]; // 886
        rating = parseFloat(match[2]); // 8.5
      }
    }
    
    // 3. Jika rating masih terlalu besar ( > 100 ), perbaiki
    if (rating && rating > 100) {
      const ratingStr = rating.toString();
      // Coba ambil 2 digit terakhir dengan desimal
      const match = ratingStr.match(/(\d+\.\d+)$/);
      if (match) {
        rating = parseFloat(match[1]);
      } else {
        // fallback: bagi 1000
        rating = rating / 1000;
      }
    }
    
    // 4. Update data
    manga.title = title || 'Unknown';
    manga.chapter = chapter || 'Unknown';
    manga.rating = rating || null;
    
    await manga.save();
    cleaned++;
    
    if (cleaned <= 5) {
      console.log('✅', title.substring(0, 30), '→ Chapter', chapter, 'Rating', rating);
    }
  }
  
  console.log(`📊 Total cleaned: ${cleaned} data manhwaindo`);
  process.exit(0);
}

cleanManhwaData();
