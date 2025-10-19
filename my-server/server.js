// This is your server.js file
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your user
  password: 'hema', // Your password
  database: 'hema' // Your database
});

dbConnection.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
    return;
  }
  console.log('Successfully connected to database with ID', dbConnection.threadId);
});

// --- API Endpoints ---

app.get('/api', (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// --- UPDATED POSTS ENDPOINT ---
// Now handles sorting (latest/oldest) and joins to get username
app.get('/api/posts', (req, res) => {
  const sortOrder = req.query.sort === 'oldest' ? 'ASC' : 'DESC'; // Default to DESC (latest)

  const query = `
    SELECT posts.post_id, posts.content, posts.content_sent_at, posts.user_id, users.name 
    FROM posts 
    JOIN users ON posts.user_id = users.user_id 
    ORDER BY posts.content_sent_at ${sortOrder}
  `;
  
  dbConnection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// --- NEW ENDPOINT for Hashtags ---
// Gets all hashtags for a specific post ID
app.get('/api/posts/:postId/hashtags', (req, res) => {
  const postId = req.params.postId;
  const query = 'SELECT hashtag FROM hashtags WHERE post_id = ?';
  
  dbConnection.query(query, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// --- Example for getting all users ---
app.get('/api/users', (req, res) => {
  const query = 'SELECT user_id, name, email, headline, summary FROM users';
  dbConnection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// --- 4. Start the Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});