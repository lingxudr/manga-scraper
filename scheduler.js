const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const scrapeNatsu = require('./scraper-natsu');

// Koneksi database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected for scheduler'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Fungsi update data
async function autoUpdate() {
  console.log(`🔄 [${new Date().toISOString()}] Auto update started...`);
  
  try {
    const data = await scrapeNatsu();
    let newCount = 0;
    let updateCount = 0;
    
    for (const item of data) {
      const existing = await Manga.findOne({ url: item.url });
      if (existing) {
        if (existing.chapter !== item.chapter) {
          existing.chapter = item.chapter;
          existing.lastUpdate = new Date();
          await existing.save();
          updateCount++;
        }
      } else {
        await Manga.create(item);
        newCount++;
      }
    }
    
    console.log(`✅ [${new Date().toISOString()}] New: ${newCount}, Updated: ${updateCount}`);
  } catch (error) {
    console.error('❌ Auto update error:', error.message);
  }
}

// JADWAL OTOMATIS:
// Setiap 6 jam (00:00, 06:00, 12:00, 18:00)
cron.schedule('0 */6 * * *', async () => {
  await autoUpdate();
});

// Jalankan sekali saat pertama kali
setTimeout(autoUpdate, 5000);

console.log('⏰ Scheduler started! Auto update every 6 hours');
console.log('📊 Monitoring manga updates...');
