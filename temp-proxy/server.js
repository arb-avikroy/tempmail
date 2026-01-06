const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;
const MAIL_TM_API = 'https://api.mail.tm';

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173' // Change to your frontend URL
}));

app.use(express.json());

// Proxy all Mail.tm API requests
app.all('/api/mail/*', async (req, res) => {
  try {
    // Extract the path after /api/mail/
    const path = req.params[0];
    const url = `${MAIL_TM_API}/${path}`;
    
    // Forward the request
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      },
      ...(req.body && Object.keys(req.body).length > 0 && { 
        body: JSON.stringify(req.body) 
      })
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});