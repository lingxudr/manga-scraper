const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();
const Manga = require('./models/Manga');

async function scrapeChaptersForManga(manga) {
  try {
    const response = await axios.get(manga.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const chapters = [];
    const seen = new Set();
    
    const allLinks = $('a');
    
    allLinks.each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      if (href && href.includes('chapter')) {
        let number = null;
        const urlMatch = href.match(/chapter[\/\-](\d+(?:\.\d+)?)/i);
        const textMatch = text.match(/(\d+(?:\.\d+)?)/);
        
        if (urlMatch) number = urlMatch[1];
        else if (textMatch) number = textMatch[1];
        
        if (number && !seen.has(href)) {
          seen.add(href);
          const fullUrl = href.startsWith('http') ? href : `https://natsu.one${href}`;
          
          if (text.length > 2 || number) {
            chapters.push({
              number: number || '?',
              title: text || `Chapter ${number}`,
              url: fullUrl
            });
          }
        }
      }
    });
    
    const maxChapters = 50;
    const savedChapters = chapters.slice(-maxChapters);
    
    if (savedChapters.length > 0) {
      await Manga.updateOne(
        { _id: manga._id },
        { 
          $set: { 
            chapters: savedChapters,
            totalChapters: chapters.length,
            lastChapterUpdate: new Date()
          }
        }
      );
      return savedChapters.length;
    }
    return 0;
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return 0;
  }
}

// EXPORT function agar bisa dipakai di file lain
module.exports = { scrapeChaptersForManga };
