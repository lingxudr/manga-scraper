const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

// Data contoh (nanti diganti dengan scraping asli)
const sampleData = [
  {
    title: "Martial Peak",
    url: "https://natsu.one/manga/martial-peak/",
    chapter: "3910",
    rating: 8.5,
    genre: ["Action", "Adventure", "Fantasy"],
    poster: "https://natsu.one/wp-content/uploads/2025/09/51a42f3f-9cbc-4e6c-a165-bdeadbb6027d.png",
    synopsis: "Perjalanan ke puncak bela diri adalah yang sepi...",
    status: "Ongoing",
    type: "Manhua",
    source: "natsu"
  }
];

async function saveData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📝 Menyimpan data contoh...');
  
  for (const data of sampleData) {
    const existing = await Manga.findOne({ url: data.url });
    if (existing) {
      console.log(`📝 Update: ${data.title}`);
      await Manga.updateOne({ url: data.url }, data);
    } else {
      console.log(`✅ Tambah baru: ${data.title}`);
      await Manga.create(data);
    }
  }
  
  const count = await Manga.countDocuments();
  console.log(`📊 Total manga di database: ${count}`);
  process.exit(0);
}

saveData().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
