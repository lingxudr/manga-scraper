const axios = require('axios');
const cheerio = require('cheerio');

async function debugNatsu() {
  console.log('🔍 Debugging Natsu...');
  
  const response = await axios.get('https://natsu.one/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  
  // Coba cari semua link yang mengandung /manga/
  const mangaLinks = [];
  $('a[href*="/manga/"]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && !href.includes('#')) {
      mangaLinks.push({ href, text: text.substring(0, 50) });
    }
  });
  
  console.log(`📊 Total link /manga/: ${mangaLinks.length}`);
  if (mangaLinks.length > 0) {
    console.log('📝 Contoh 5 link pertama:');
    mangaLinks.slice(0, 5).forEach((link, i) => {
      console.log(`  ${i+1}. ${link.text} → ${link.href}`);
    });
  }
  
  // Coba cari gambar (poster)
  const images = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src && src.includes('wp-content/uploads')) {
      images.push(src);
    }
  });
  
  console.log(`\n📸 Total poster images: ${images.length}`);
  if (images.length > 0) {
    console.log('📝 Contoh poster:', images[0]);
  }
  
  process.exit(0);
}

debugNatsu();
