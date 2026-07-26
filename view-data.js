const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function viewData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = await Manga.find().limit(5);
  console.log(`📊 Total: ${await Manga.countDocuments()}`);
  console.log('\n📖 Sample Data:');
  data.forEach((m, i) => {
    console.log(`${i+1}. ${m.title} - Chapter ${m.chapter} (${m.source})`);
  });
  process.exit(0);
}

viewData();
