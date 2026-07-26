const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendNotification(message) {
  try {
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const payload = {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    };
    
    const response = await axios.post(url, payload);
    if (response.data.ok) {
      console.log('✅ Telegram notification sent');
      return true;
    } else {
      console.error('❌ Telegram error:', response.data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Telegram error:', error.message);
    return false;
  }
}

async function sendUpdateReport(newCount, updateCount, total) {
  const now = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let msg = '📢 *UPDATE MANGA*\n\n';
  
  if (newCount > 0) {
    msg += `✅ *${newCount}* manga baru ditemukan!\n`;
  }
  
  if (updateCount > 0) {
    msg += `📝 *${updateCount}* manga update chapter!\n`;
  }
  
  if (newCount === 0 && updateCount === 0) {
    msg += 'ℹ️ Tidak ada perubahan pada data manga.\n';
  }
  
  msg += `\n📊 Total manga: *${total}*\n`;
  msg += `🕐 ${now}\n`;
  msg += `\n---\n🤖 _Auto Scraper Running 24/7_`;
  
  await sendNotification(msg);
}

async function sendStartupMessage() {
  const msg = `
🚀 *Manga Scraper Active!*

✅ API running
✅ Auto update setiap 6 jam
📊 Total manga: 116

---
🤖 _Monitoring manga updates_
  `;
  await sendNotification(msg);
}

module.exports = { sendNotification, sendUpdateReport, sendStartupMessage };
