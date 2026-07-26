const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

// Tambah field chapters jika belum ada
async function ensureChaptersField() {
  const sample = await Manga.findOne();
  if (sample && sample.chapters === undefined) {
    await Manga.updateMany({}, { $set: { chapters: [], totalChapters: 0 } });
    console.log('✅ Field chapters ditambahkan');
  }
}

// Scrape chapters untuk satu manga
async function scrapeChaptersForManga(manga) {
  try {
    console.log(`📖 ${manga.title} (${manga.source})...`);
    
    const response = await axios.get(manga.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const chapters = [];
    
    // SELECTOR UNTUK CHAPTER LIST (dari siteInsights)
    const selectors = [
      '.wp-manga-chapter a',
      '#chapterlist li a',
      '.episodelist ul li a',
      '.bxcl ul li a',
      '.chapter-list li a',
      '.list-chapter a'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        const chapterUrl = $(el).attr('href');
        const chapterText = $(el).text().trim();
        const match = chapterText.match(/(\d+(?:\.\d+)?)/);
        const number = match ? match[1] : null;
        
        if (chapterUrl && number && !chapters.some(c => c.url === chapterUrl)) {
          chapters.push({
            number: number,
            title: chapterText,
            url: chapterUrl.startsWith('http') ? chapterUrl : 
                 manga.source === 'kiryuu' ? `https://v7.kiryuu.to${chapterUrl}` :
                 manga.source === 'natsu' ? `https://natsu.one${chapterUrl}` :
                 chapterUrl
          });
        }
      });
      
      // Kalau udah dapat chapters, berhenti
      if (chapters.length > 0) break;
    }
    
    // Update database
    if (chapters.length > 0) {
      await Manga.updateOne(
        { _id: manga._id },
        { 
          $set: { 
            chapters: chapters,
            totalChapters: chapters.length,
            lastChapterUpdate: new Date()
          }
        }
      );
      console.log(`✅ ${chapters.length} chapters`);
      return chapters.length;
    } else {
      console.log(`⚠️ No chapters found`);
      return 0;
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return 0;
  }
}

// Main function
async function scrapeAllChapters() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
  
  await ensureChaptersField();
  
  // Ambil manga yang belum punya chapters
  const mangaList = await Manga.find({ 
    $or: [
      { chapters: { $exists: false } },
      { chapters: { $size: 0 } }
    ]
  });
  
  console.log(`\n📊 Manga tanpa chapters: ${mangaList.length}`);
  console.log('🔄 Memulai scraping...\n');
  
  let total = 0;
  
  for (const manga of mangaList) {
    const count = await scrapeChaptersForManga(manga);
    total += count;
    
    // Delay agar tidak kena block
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n📊 TOTAL: ${total} chapters dari ${mangaList.length} manga`);
  
  // Statistik
  const withChapters = await Manga.countDocuments({ 
    chapters: { $exists: true, $ne: [] } 
  });
  console.log(`📊 Manga dengan chapters: ${withChapters}`);
  
  process.exit(0);
}

// Jalankan
scrapeAllChapters();
