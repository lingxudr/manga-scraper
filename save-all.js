const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const scrapeNatsu = require('./scraper-natsu');

async function saveAllData() {
  console.log('🔄 Starting full sync...');
  
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Scrape data
  const data = await scrapeNatsu();
  
  let newCount = 0;
  let updateCount = 0;
  
  for (const item of data) {
    const existing = await Manga.findOne({ url: item.url });
    if (existing) {
      // Update jika ada perubahan chapter
      if (existing.chapter !== item.chapter) {
        existing.chapter = item.chapter;
        existing.lastUpdate = new Date();
        await existing.save();
        updateCount++;
        console.log(`📝 Update: ${item.title} → Chapter ${item.chapter}`);
      }
    } else {
      // Data baru
      await Manga.create(item);
      newCount++;
      console.log(`✅ New: ${item.title}`);
    }
  }
  
  const total = await Manga.countDocuments();
  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ New: ${newCount}`);
  console.log(`📝 Updated: ${updateCount}`);
  console.log(`📊 Total in DB: ${total}`);
  
  process.exit(0);
}

saveAllData().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
