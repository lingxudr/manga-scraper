const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

// User-Agent random
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

function randomDelay() {
  return new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
}

async function scrapeNatsuPages() {
  console.log('📖 Scraping Natsu all pages...');
  let total = 0;
  
  for (let page = 1; page <= 20; page++) {
    const url = `https://natsu.one/page/${page}/`;
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      let found = 0;
      
      $('a[href*="/manga/"]').each((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && title.length > 2 && !href.includes('#')) {
          found++;
          // Cek sudah ada di database
          // (di sini bisa langsung simpan)
        }
      });
      
      console.log(`  Page ${page}: ${found} links`);
      total += found;
      
      if (found === 0) break;
      await randomDelay();
      
    } catch (error) {
      if (error.response?.status === 404) break;
      console.log(`  Page ${page}: error - ${error.message}`);
    }
  }
  
  console.log(`✅ Natsu total: ${total} manga`);
  return total;
}

// SAMA UNTUK KIRYUU
async function scrapeKiryuuPages() {
  console.log('📖 Scraping Kiryuu all pages...');
  let total = 0;
  
  for (let page = 1; page <= 20; page++) {
    const url = `https://v7.kiryuu.to/page/${page}/`;
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      let found = 0;
      
      $('a[href*="/manga/"]').each((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && title.length > 2) {
          found++;
        }
      });
      
      console.log(`  Page ${page}: ${found} links`);
      total += found;
      
      if (found === 0) break;
      await randomDelay();
      
    } catch (error) {
      if (error.response?.status === 404) break;
      console.log(`  Page ${page}: error - ${error.message}`);
    }
  }
  
  console.log(`✅ Kiryuu total: ${total} manga`);
  return total;
}

// SAMA UNTUK MANHWAINDO (248 HALAMAN!)
async function scrapeManhwaindoPages() {
  console.log('📖 Scraping Manhwaindo all pages...');
  let total = 0;
  
  for (let page = 1; page <= 248; page++) {
    const url = `https://www.manhwaindo.my/page/${page}/`;
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      let found = 0;
      
      $('a[href*="/series/"]').each((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && title.length > 2) {
          found++;
        }
      });
      
      console.log(`  Page ${page}: ${found} links`);
      total += found;
      
      if (found === 0) break;
      if (page % 10 === 0) {
        console.log(`  📊 ${page}/248 pages done...`);
      }
      await randomDelay();
      
    } catch (error) {
      if (error.response?.status === 404) break;
      console.log(`  Page ${page}: error - ${error.message}`);
    }
  }
  
  console.log(`✅ Manhwaindo total: ${total} manga`);
  return total;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected\n');
  
  const natsu = await scrapeNatsuPages();
  const kiryuu = await scrapeKiryuuPages();
  const manhwaindo = await scrapeManhwaindoPages();
  
  console.log('\n📊 TOTAL POTENTIAL:');
  console.log(`  Natsu: ${natsu}`);
  console.log(`  Kiryuu: ${kiryuu}`);
  console.log(`  Manhwaindo: ${manhwaindo}`);
  console.log(`  TOTAL: ${natsu + kiryuu + manhwaindo}`);
  
  process.exit(0);
}

main();
