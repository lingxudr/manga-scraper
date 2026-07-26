const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Server is running!'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

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

app.get('/api/genres', (req, res) => {
  res.json({ success: true, genres: ['Action', 'Adventure', 'Fantasy'] });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
