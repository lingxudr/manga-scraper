const axios = require('axios');
const cheerio = require('cheerio');

async function debugChapter() {
  console.log('🔍 Mencari struktur HTML...');
  
  const response = await axios.get('https://natsu.one/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  
  // Cari element yang mengandung angka chapter
  console.log('\n📝 Cari pola "Chapter" di text:');
  const text = $('body').text();
  const matches = text.match(/Chapter[: ]*(\d+(?:\.\d+)?)/gi);
  if (matches) {
    console.log(`Ditemukan ${matches.length} mention chapter`);
    matches.slice(0, 10).forEach(m => console.log(`  ${m}`));
  }
  
  // Cari di sekitar link manga
  console.log('\n🔍 Cek link manga pertama:');
  const firstLink = $('a[href*="/manga/"]').first();
  const parent = firstLink.closest('div, li, article');
  console.log('Parent HTML (200 chars):');
  console.log(parent.html()?.substring(0, 200));
  
  process.exit(0);
}

debugChapter();
