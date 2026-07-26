const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('📤 TOKEN:', TOKEN ? '✅ Ada' : '❌ Tidak ada');
console.log('📤 CHAT_ID:', CHAT_ID ? '✅ Ada' : '❌ Tidak ada');

if (!TOKEN || !CHAT_ID) {
  console.log('❌ Cek .env, ada yang kurang');
  process.exit(1);
}

async function test() {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: '✅ *Test Notifikasi!*\n\nScraper berhasil terhubung ke Telegram!',
    parse_mode: 'Markdown'
  };
  
  try {
    const response = await axios.post(url, payload);
    if (response.data.ok) {
      console.log('✅ Pesan terkirim! Cek Telegram kamu.');
    } else {
      console.log('❌ Gagal:', response.data.description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📌 Pastikan:');
    console.log('  1. Token benar');
    console.log('  2. Chat_ID benar');
    console.log('  3. Kamu sudah chat bot (klik /start)');
  }
  process.exit(0);
}

test();
