const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function scrapeChaptersForManga(manga) {
  try {
    console.log(`📖 ${manga.title}...`);
    
    const response = await axios.get(manga.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const chapters = [];
    const seen = new Set();
    
    // SELECTOR YANG WORKS: a[href*="chapter-"]
    $('a[href*="chapter-"]').each((i, el) => {
      const chapterUrl = $(el).attr('href');
      const chapterText = $(el).text().trim();
      
      // Filter yang punya angka
      const match = chapterText.match(/\d+(?:\.\d+)?/);
      const number = match ? match[1] : null;
      
      // Validasi: harus ada URL, angka, dan teksnya masuk akal
      if (chapterUrl && number && chapterText.length > 2) {
        // URL absolut
        const fullUrl = chapterUrl.startsWith('http') ? chapterUrl : `https://natsu.one${chapterUrl}`;
        
        // Cegah duplikat
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          chapters.push({
            number: number,
            title: chapterText.substring(0, 100),
            url: fullUrl
          });
        }
      }
    });
    
    // Batasi maksimal 100 chapter (karena 3867 terlalu banyak)
    const maxChapters = 100;
    const savedChapters = chapters.slice(0, maxChapters);
    
    if (savedChapters.length > 0) {
      await Manga.updateOne(
        { _id: manga._id },
        { 
          $set: { 
            chapters: savedChapters,
            totalChapters: chapters.length,
            lastChapterUpdate: new Date()
          }
        }
      );
      console.log(`✅ ${savedChapters.length} chapters (total ${chapters.length} ditemukan)`);
      return savedChapters.length;
    } else {
      console.log(`⚠️ No chapters found`);
      return 0;
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return 0;
  }
}

async function scrapeAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
  
  // Ambil 5 manga dulu buat test
  const mangaList = await Manga.find({ 
    $or: [
      { chapters: { $exists: false } },
      { chapters: { $size: 0 } }
    ]
  }).limit(5);
  
  console.log(`📊 Testing 5 manga...\n`);
  
  for (const manga of mangaList) {
    await scrapeChaptersForManga(manga);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Tampilkan hasil
  const withChapters = await Manga.countDocuments({ 
    chapters: { $exists: true, $ne: [] } 
  });
  console.log(`\n📊 Manga dengan chapters: ${withChapters}`);
  process.exit(0);
}

scrapeAll();
