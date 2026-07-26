const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Route dasar untuk cek server
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Route health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Route API manga (data statis dulu)
app.get('/api/manga', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: [
      { title: 'Martial Peak', chapter: '3910' },
      { title: 'One Piece', chapter: '1189' }
    ]
  });
});

// Route API genres
app.get('/api/genres', (req, res) => {
  res.json({
    success: true,
    genres: ['Action', 'Adventure', 'Fantasy', 'Comedy']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
