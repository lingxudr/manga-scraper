const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

// Data chapter populer dari berbagai sumber (update sendiri)
const chapterData = {
  'Martial Peak': '3910',
  'One Piece': '1189',
  'God of Martial Arts': '1179',
  'Magic Emperor': '886',
  'Apotheosis': '1301',
  'Demonic Emperor': '886',
  'Kingdom': '883',
  'Spare Me, Great Lord!': '753',
  'Yuan Zun': '652.5',
  'Tales of Demons and Gods': '500+',
  'Nano Machine': '200+',
  'Lookism': '617',
  'Eleceed': '8.53',
  'Tower of God': '8.57',
  'Swordmaster\'s Youngest Son': '204',
  'I Randomly Have A New Career Every Week': '910',
  'Revenge Of The Iron-Blooded Sword Hound': '100+',
  'Solo Max-Level Newbie': '150+',
  'Leveling In The Future': '80+',
  'Tsuihou Sareta Tenshou Juu Kishi': '50+'
};

async function fixAllChapters() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const allManga = await Manga.find({});
  console.log('📊 Total manga:', allManga.length);
  
  let fixed = 0;
  
  for (const manga of allManga) {
    let newChapter = null;
    
    // 1. Coba dari title (angka pertama di title)
    const titleMatch = manga.title.match(/(\d+(?:\.\d+)?)/);
    if (titleMatch && !manga.title.includes('Chapter')) {
      newChapter = titleMatch[1];
    }
    
    // 2. Coba dari data manual di atas
    if (!newChapter) {
      for (const [key, val] of Object.entries(chapterData)) {
        if (manga.title.toLowerCase().includes(key.toLowerCase())) {
          newChapter = val;
          break;
        }
      }
    }
    
    // 3. Coba dari URL
    if (!newChapter && manga.url) {
      const urlMatch = manga.url.match(/\/(\d+)\/?$/);
      if (urlMatch) {
        newChapter = urlMatch[1];
      }
    }
    
    if (newChapter && (manga.chapter === 'Unknown' || !manga.chapter)) {
      manga.chapter = newChapter;
      await manga.save();
      fixed++;
      console.log('✅ ' + manga.title.substring(0, 30) + ' → Chapter ' + newChapter);
    }
  }
  
  console.log('📊 Fixed ' + fixed + ' manga chapters');
  
  // Tampilkan sample
  const samples = await Manga.find().limit(5);
  console.log('\n📖 Sample Data:');
  samples.forEach((m, i) => {
    console.log((i+1) + '. ' + m.title + ' - Chapter ' + m.chapter);
  });
  
  process.exit(0);
}

fixAllChapters();
