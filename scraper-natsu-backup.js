const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNatsu() {
  console.log('🔄 Scraping Natsu.one...');
  
  const response = await axios.get('https://natsu.one/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  const results = [];
  const seen = new Set();
  
  // CARI SEMUA LINK MANGA
  $('a[href*="/manga/"]').each((i, el) => {
    const url = $(el).attr('href');
    if (!url || seen.has(url)) return;
    seen.add(url);
    
    // Cari title dari element terdekat
    let title = $(el).find('h2, h3, .title, .jdlflm').first().text().trim();
    if (!title) {
      title = $(el).text().trim();
    }
    
    // Cari gambar terdekat
    const poster = $(el).find('img').attr('data-src') || 
                   $(el).find('img').attr('src') || '';
    
    // Cari chapter
    let chapter = '';
    const parent = $(el).closest('div');
    if (parent.length) {
      const chapterText = parent.find('.chapter, .chapter-number, .epz, .episode').first().text().trim();
      if (chapterText) {
        const match = chapterText.match(/\d+(?:\.\d+)?/);
        if (match) chapter = match[0];
      }
    }
    
    // Clean title
    title = title.replace(/^(Manga|Manhwa|Manhua|Hot|🔥)/g, '').trim();
    title = title.replace(/\s+/g, ' ').trim();
    
    if (title && title.length > 1 && title.length < 100) {
      results.push({
        title,
        url: url.startsWith('http') ? url : `https://natsu.one${url}`,
        poster: poster || '',
        chapter: chapter || 'Unknown',
        source: 'natsu',
        lastUpdate: new Date()
      });
    }
  });
  
  // HAPUS DUPLIKAT
  const unique = [];
  const titleSet = new Set();
  for (const item of results) {
    if (!titleSet.has(item.title)) {
      titleSet.add(item.title);
      unique.push(item);
    }
  }
  
  console.log(`✅ Scraped ${unique.length} manga dari Natsu`);
  return unique.slice(0, 30); // Ambil 30 aja dulu
};

module.exports = scrapeNatsu;
