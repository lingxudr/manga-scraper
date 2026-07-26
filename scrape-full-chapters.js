const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function scrapeFullChapters(manga) {
  try {
    console.log(`📖 ${manga.title.substring(0, 30)}...`);
    
    const response = await axios.get(manga.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const chapters = [];
    const seen = new Set();
    
    // Ambil SEMUA link chapter
    $('a[href*="chapter"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      if (href && href.includes('chapter')) {
        const match = href.match(/chapter[\/\-](\d+(?:\.\d+)?)/i);
        const number = match ? match[1] : null;
        
        if (number && !seen.has(href)) {
          seen.add(href);
          const fullUrl = href.startsWith('http') ? href : `https://natsu.one${href}`;
          chapters.push({
            number: number,
            title: text || `Chapter ${number}`,
            url: fullUrl
          });
        }
      }
    });
    
    // Simpan SEMUA chapter (tanpa batasan!)
    if (chapters.length > 0) {
      await Manga.updateOne(
        { _id: manga._id },
        { 
          $set: { 
            chapters: chapters, // SEMUA CHAPTER!
            totalChapters: chapters.length,
            lastChapterUpdate: new Date()
          }
        }
      );
      console.log(`✅ ${chapters.length} chapters (FULL!)`);
      return chapters.length;
    }
    return 0;
    
  } catch (error) {
    console.error(`❌ ${error.message}`);
    return 0;
  }
}

async function scrapeAllFull() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
  
  // Ambil 5 manga dulu buat test
  const mangaList = await Manga.find({}).limit(5);
  console.log(`📊 Testing 5 manga...\n`);
  
  for (const manga of mangaList) {
    await scrapeFullChapters(manga);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n✅ Test selesai! Cek hasilnya.');
  process.exit(0);
}

scrapeAllFull();
