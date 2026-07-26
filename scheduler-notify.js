const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');
const scrapeNatsu = require('./scraper-natsu');
const { sendUpdateReport, sendStartupMessage } = require('./notify');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

async function autoUpdate() {
  console.log(`🔄 [${new Date().toISOString()}] Auto update...`);
  
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
    
    const total = await Manga.countDocuments();
    console.log(`✅ New: ${newCount}, Updated: ${updateCount}, Total: ${total}`);
    
    await sendUpdateReport(newCount, updateCount, total);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Setiap 6 jam
cron.schedule('0 */6 * * *', autoUpdate);

// Jalankan sekali saat startup
setTimeout(async () => {
  await autoUpdate();
  await sendStartupMessage();
}, 5000);

console.log('⏰ Scheduler + Telegram running!');
console.log('📱 Notifikasi akan dikirim ke Telegram');
