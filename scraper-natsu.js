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
    
    // Cari title
    let title = $(el).find('h2, h3, .title, .jdlflm').first().text().trim();
    if (!title) {
      title = $(el).text().trim();
    }
    
    // HAPUS ANGKA DI AWAL (Ch. 78 → ambil judul asli)
    if (title.match(/^Ch\.\s*\d+/i)) {
      // Cari judul dari element parent
      const parent = $(el).closest('.item, .series, .manga-item, .featured-item');
      if (parent.length) {
        const realTitle = parent.find('.title, h2, h3, .name').first().text().trim();
        if (realTitle) title = realTitle;
      }
    }
    
    // Poster
    const poster = $(el).find('img').attr('data-src') || 
                   $(el).find('img').attr('src') || '';
    
    // CHAPTER - cari lebih teliti
    let chapter = 'Unknown';
    const parent = $(el).closest('.item, .series, .manga-item, .featured-item, .detpost, .bs');
    if (parent.length) {
      const chapterText = parent.find('.chapter, .chapter-number, .epz, .episode, .chap, .ch').first().text().trim();
      if (chapterText) {
        const match = chapterText.match(/(\d+(?:\.\d+)?)/);
        if (match) chapter = match[1];
      }
    }
    
    // RATING
    let rating = null;
    if (parent.length) {
      const ratingText = parent.find('.rating, .score, .ratec, .num').first().text().trim();
      if (ratingText) {
        const match = ratingText.match(/(\d+\.?\d*)/);
        if (match) rating = parseFloat(match[1]);
      }
    }
    
    // GENRE
    const genres = [];
    if (parent.length) {
      parent.find('.genre a, .genres a, .tags a').each((i, el) => {
        const g = $(el).text().trim();
        if (g && g.length < 30) genres.push(g);
      });
    }
    
    // SINOPSIS
    let synopsis = '';
    if (parent.length) {
      synopsis = parent.find('.synopsis, .summary, .desc, .sinopsis').first().text().trim();
    }
    
    // Clean title
    title = title.replace(/^(Manga|Manhwa|Manhua|Hot|🔥|Read|Baca)/gi, '').trim();
    title = title.replace(/\s+/g, ' ').trim();
    
    // Skip title yang terlalu pendek atau cuma "Ch."
    if (title.length < 2 || title.match(/^Ch\.?\s*$/i)) return;
    
    // Skip jika title cuma angka
    if (title.match(/^\d+$/)) return;
    
    // Deteksi type
    let type = 'Manga';
    if (title.includes('Manhwa') || poster.includes('manhwa')) type = 'Manhwa';
    else if (title.includes('Manhua') || poster.includes('manhua')) type = 'Manhua';
    
    results.push({
      title: title.substring(0, 100),
      url: url.startsWith('http') ? url : `https://natsu.one${url}`,
      poster: poster || '',
      chapter: chapter,
      rating: rating,
      genre: genres.slice(0, 5),
      synopsis: synopsis.substring(0, 500),
      status: 'Ongoing',
      type: type,
      source: 'natsu',
      lastUpdate: new Date()
    });
  });
  
  // HAPUS DUPLIKAT berdasarkan title (case insensitive)
  const unique = [];
  const titleSet = new Set();
  for (const item of results) {
    const key = item.title.toLowerCase().trim();
    if (!titleSet.has(key)) {
      titleSet.add(key);
      unique.push(item);
    }
  }
  
  console.log(`✅ Scraped ${unique.length} manga dari Natsu`);
  return unique;
};

module.exports = scrapeNatsu;
