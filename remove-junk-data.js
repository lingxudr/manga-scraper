const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function removeJunk() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Hapus data yang judulnya "Ch. XX" (ini bukan manga, tapi chapter)
  const result = await Manga.deleteMany({
    title: { $regex: /^Ch\.\s*\d+$/i }
  });
  
  console.log('🗑️ Hapus data junk:', result.deletedCount);
  
  // Cek total setelah dihapus
  const total = await Manga.countDocuments();
  console.log('📊 Total manga sekarang:', total);
  
  process.exit(0);
}

removeJunk();
