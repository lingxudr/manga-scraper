const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const { scrapeFullChapters } = require('./scrape-full-chapters');

async function scrapeAllFull() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
  
  const mangaList = await Manga.find({});
  console.log(`📊 Total manga: ${mangaList.length}`);
  console.log('🔄 Scraping FULL chapters...\n');
  
  let totalChapters = 0;
  
  for (let i = 0; i < mangaList.length; i++) {
    const manga = mangaList[i];
    console.log(`[${i+1}/${mangaList.length}] 📖 ${manga.title.substring(0, 30)}...`);
    
    const count = await scrapeFullChapters(manga);
    totalChapters += count;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n✅ TOTAL: ${totalChapters} chapters dari ${mangaList.length} manga`);
  process.exit(0);
}

scrapeAllFull();
