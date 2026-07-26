const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  number: String,
  title: String,
  url: String
});

const mangaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  poster: String,
  chapter: String,
  rating: Number,
  genre: [String],
  synopsis: String,
  status: String,
  type: String,
  source: String,
  chapters: [chapterSchema],
  totalChapters: Number,
  lastChapterUpdate: Date,
  lastUpdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Manga', mangaSchema);
