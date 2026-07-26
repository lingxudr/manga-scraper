const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const { scrapeChaptersForManga } = require('./scrape-chapters-v4');

async function scrapeAllManga() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
  
  const mangaList = await Manga.find({ 
    $or: [
      { chapters: { $exists: false } },
      { chapters: { $size: 0 } }
    ]
  });
  
  console.log(`📊 Total manga tanpa chapters: ${mangaList.length}`);
  console.log('🔄 Memulai scraping...\n');
  
  let success = 0;
  let totalChapters = 0;
  
  for (let i = 0; i < mangaList.length; i++) {
    const manga = mangaList[i];
    const title = manga.title.substring(0, 50);
    console.log(`[${i+1}/${mangaList.length}] 📖 ${title}...`);
    
    const count = await scrapeChaptersForManga(manga);
    if (count > 0) {
      success++;
      totalChapters += count;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ ${success}/${mangaList.length} manga berhasil`);
  console.log(`📚 Total chapters: ${totalChapters}`);
  
  const withChapters = await Manga.countDocuments({ 
    chapters: { $exists: true, $ne: [] } 
  });
  console.log(`📊 Manga dengan chapters: ${withChapters}`);
  
  process.exit(0);
}

scrapeAllManga();
