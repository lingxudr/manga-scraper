const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔄 Mencoba koneksi ke MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ BERHASIL! Koneksi sukses!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ GAGAL:', error.message);
    process.exit(1);
  });
