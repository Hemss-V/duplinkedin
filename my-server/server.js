// src/my-server/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating tokens

const app = express();
const port = 3001;

// A secret key for signing tokens. In a real app, this should be in a .env file!
const JWT_SECRET = 'your-super-secret-key-12345';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hema',
  database: 'hema'
});

dbConnection.connect(err => {
  if (err) return console.error('Error connecting to database:', err.stack);
  console.log('Successfully connected to database with ID', dbConnection.threadId);
});

// --- API Endpoints ---

// --- NEW: User Registration ---
app.post('/api/register', async (req, res) => {
  const { name, email, password, headline, summary, age, description } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (name, email, password, headline, summary, age, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  dbConnection.query(query, [name, email, hashedPassword, headline, summary, age, description], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already in use.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User registered successfully!' });
  });
});

// --- NEW: User Login ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  
  dbConnection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // 1. Check if user exists
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = results[0];

    // 2. Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Create a token (a "digital ID card")
    const token = jwt.sign(
      { userId: user.user_id, name: user.name }, // This is the data in the "ID card"
      JWT_SECRET, 
      { expiresIn: '24h' } // The "ID card" expires in 24 hours
    );

    // 4. Send the token and user info to the client
    res.json({
      message: 'Login successful!',
      token: token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        description: user.description
      }
    });
  });
});


// --- All your other endpoints below ---

app.get('/api/posts', (req, res) => {
  const sortOrder = req.query.sort === 'oldest' ? 'ASC' : 'DESC';
  const query = `
    SELECT posts.post_id, posts.content, posts.content_sent_at, posts.user_id, users.name 
    FROM posts 
    JOIN users ON posts.user_id = users.user_id 
    ORDER BY posts.content_sent_at ${sortOrder}
  `;
  dbConnection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/posts', (req, res) => {
  const { content, user_id } = req.body;
  if (!content || !user_id) return res.status(400).json({ error: 'Post content and user_id are required.' });
  const query = 'INSERT INTO posts (content, content_sent_at, user_id) VALUES (?, NOW(), ?)';
  dbConnection.query(query, [content, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Post created!', postId: results.insertId });
  });
});

app.get('/api/posts/:postId/hashtags', (req, res) => {
  const postId = req.params.postId;
  const query = 'SELECT hashtag FROM hashtags WHERE post_id = ?';
  dbConnection.query(query, [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/posts/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const query = `
    SELECT c.comment_content, c.created_at, u.name 
    FROM comments c
    JOIN users u ON c.commenter_id = u.user_id 
    WHERE c.post_id = ? 
    ORDER BY c.created_at ASC
  `;
  dbConnection.query(query, [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const { comment_content, commenter_id } = req.body;
  if (!comment_content || !commenter_id) return res.status(400).json({ error: 'Comment content and commenter_id are required.' });
  const query = 'INSERT INTO comments (comment_content, created_at, post_id, commenter_id) VALUES (?, NOW(), ?, ?)';
  dbConnection.query(query, [comment_content, postId, commenter_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Comment created!', commentId: results.insertId });
  });
});

app.get('/api/users', (req, res) => {
  const query = 'SELECT user_id, name, email, headline, summary FROM users';
  dbConnection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT user_id, name, headline, summary, description FROM users WHERE user_id = ?';
  dbConnection.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]); 
  });
});

app.get('/api/users/:userId/connections/count', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT COUNT(*) as connectionCount 
    FROM connections 
    WHERE (connection1_id = ? OR connection2_id = ?) AND status = 1
  `;
  dbConnection.query(query, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const count = (results && results[0]) ? results[0].connectionCount : 0;
    res.json({ count: count });
  });
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});