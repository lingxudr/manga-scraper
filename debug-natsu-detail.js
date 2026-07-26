const axios = require('axios');
const cheerio = require('cheerio');

async function debugNatsuDetail() {
  const url = 'https://natsu.one/manga/martial-peak/';
  console.log('🔍 Debugging:', url);
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  
  console.log('\n📝 Mencari chapter...');
  
  // Coba berbagai selector
  const selectors = [
    '.chapter-list li a',
    '.wp-manga-chapter a',
    '#chapterlist li a',
    '.list-chapter a',
    'a[href*="chapter-"]',
    '.chapter-item a'
  ];
  
  for (const selector of selectors) {
    const found = $(selector);
    if (found.length > 0) {
      console.log(`\n✅ Selector "${selector}" found: ${found.length} items`);
      found.slice(0, 3).each((i, el) => {
        console.log(`  ${i+1}. ${$(el).text().trim()} → ${$(el).attr('href')}`);
      });
    } else {
      console.log(`❌ Selector "${selector}" not found`);
    }
  }
  
  // Cari semua link yang mengandung "chapter"
  console.log('\n📝 Semua link dengan "chapter":');
  $('a[href*="chapter"]').slice(0, 5).each((i, el) => {
    console.log(`  ${i+1}. ${$(el).text().trim()}`);
  });
  
  process.exit(0);
}

debugNatsuDetail();
