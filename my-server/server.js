// my-server/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const JWT_SECRET = 'your-super-secret-key-12345'; // Keep this safe!

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hema',
  database: 'hema'
}).promise(); // Use .promise() for async/await!

// --- Auth Middleware ---
const protectRoute = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; 
    next(); 
  });
};

// --- Helper function to find connection (used in multiple places) ---
const findConnection = async (userId1, userId2) => {
    const query = `
        SELECT * FROM connections 
        WHERE (connection1_id = ? AND connection2_id = ?) OR (connection1_id = ? AND connection2_id = ?)
    `;
    const [results] = await dbConnection.query(query, [userId1, userId2, userId2, userId1]);
    return results[0]; // Returns the connection row or undefined
};


// --- API Endpoints ---

// --- Public Routes ---
app.post('/api/register', async (req, res) => {
  const { name, email, password, headline, summary, age, description } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, password, headline, summary, age, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await dbConnection.query(query, [name, email, hashedPassword, headline, summary, age, description]);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already in use.' });
    }
    console.error("Registration Error:", err); // Log the error
    return res.status(500).json({ error: "Server error during registration." });
  }
});

app.post('/api/login', async (req, res) => {
   const { email, password } = req.body;
  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results] = await dbConnection.query(query, [email]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.user_id, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful!',
      token: token,
      user: { user_id: user.user_id, name: user.name, email: user.email, description: user.description }
    });
  } catch (err) {
    console.error("Login Error:", err); // Log the error
    return res.status(500).json({ error: "Server error during login." });
  }
});

// --- Protected Routes ---
app.get('/api/posts', protectRoute, async (req, res) => {
  try {
    const sortOrder = req.query.sort === 'oldest' ? 'ASC' : 'DESC';
    const query = `
      SELECT posts.post_id, posts.content, posts.content_sent_at, posts.user_id, users.name 
      FROM posts 
      JOIN users ON posts.user_id = users.user_id 
      ORDER BY posts.content_sent_at ${sortOrder}
    `;
    const [results] = await dbConnection.query(query);
    res.json(results);
  } catch (err) {
     console.error("Get Posts Error:", err);
     res.status(500).json({ error: "Failed to fetch posts." });
  }
});

app.post('/api/posts', protectRoute, async (req, res) => {
 try {
    const { content } = req.body;
    const user_id = req.user.userId; 
    if (!content) return res.status(400).json({ error: 'Post content is required.' });
    const query = 'INSERT INTO posts (content, content_sent_at, user_id) VALUES (?, NOW(), ?)';
    await dbConnection.query(query, [content, user_id]);
    res.status(201).json({ message: 'Post created successfully!' });
  } catch (err) {
     console.error("Create Post Error:", err);
     res.status(500).json({ error: "Failed to create post." });
  }
});
app.get('/api/posts/:postId/hashtags', protectRoute, async (req, res) => {
  try {
    const { postId } = req.params;
    const query = 'SELECT hashtag FROM hashtags WHERE post_id = ?';
    const [results] = await dbConnection.query(query, [postId]);
    res.json(results);
  } catch (err) {
     console.error("Get Hashtags Error:", err);
     res.status(500).json({ error: "Failed to get hashtags." });
  }
});
app.get('/api/posts/:postId/comments', protectRoute, async (req, res) => {
  try {
    const { postId } = req.params;
    const query = `
      SELECT c.comment_content, c.created_at, u.name 
      FROM comments c
      JOIN users u ON c.commenter_id = u.user_id 
      WHERE c.post_id = ? ORDER BY c.created_at ASC
    `;
    const [results] = await dbConnection.query(query, [postId]);
    res.json(results);
  } catch (err) {
     console.error("Get Comments Error:", err);
     res.status(500).json({ error: "Failed to get comments." });
  }
});
app.post('/api/posts/:postId/comments', protectRoute, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment_content } = req.body;
    const commenter_id = req.user.userId; 
    if (!comment_content) return res.status(400).json({ error: 'Comment content is required.' });
    const query = 'INSERT INTO comments (comment_content, created_at, post_id, commenter_id) VALUES (?, NOW(), ?, ?)';
    await dbConnection.query(query, [comment_content, postId, commenter_id]);
    res.status(201).json({ message: 'Comment created!' });
  } catch (err) {
     console.error("Add Comment Error:", err);
     res.status(500).json({ error: "Failed to add comment." });
  }
});
app.get('/api/users/:userId', protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT user_id, name, headline, summary, description FROM users WHERE user_id = ?';
    const [results] = await dbConnection.query(query, [userId]);
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  } catch (err) {
     console.error("Get User Profile Error:", err);
     res.status(500).json({ error: "Failed to get user profile." });
  }
});
app.get('/api/users/:userId/connections/count', protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT COUNT(*) as connectionCount FROM connections 
      WHERE (connection1_id = ? OR connection2_id = ?) AND status = 1
    `;
    const [results] = await dbConnection.query(query, [userId, userId]);
    const count = (results && results[0]) ? results[0].connectionCount : 0;
    res.json({ count: count });
  } catch (err) {
     console.error("Get Connection Count Error:", err);
     res.status(500).json({ error: "Failed to get connection count." });
  }
});
app.get('/api/connections', protectRoute, async (req, res) => {
  try {
    const myUserId = req.user.userId;
    const query = `
      SELECT 
        DISTINCT u.user_id, u.name, u.headline
      FROM users u
      JOIN connections c ON 
        (c.connection1_id = u.user_id AND c.connection2_id = ?) OR 
        (c.connection2_id = u.user_id AND c.connection1_id = ?)
      WHERE c.status = 1 AND u.user_id != ?
    `;
    const [connections] = await dbConnection.query(query, [myUserId, myUserId, myUserId]);
    res.json(connections);
   } catch (err) {
     console.error("Get Connections Error:", err);
     res.status(500).json({ error: "Failed to get connections." });
  }
});
app.get('/api/conversations', protectRoute, async (req, res) => {
  try {
    const myUserId = req.user.userId;
    const query = `
      SELECT 
        u.user_id, u.name, m.content as lastMessage, m.content_sent_at as lastMessageTime
      FROM users u
      JOIN (
        SELECT 
          IF(sender_id = ?, receiver_id, sender_id) AS other_user_id, MAX(content_sent_at) AS max_sent_at
        FROM messages WHERE sender_id = ? OR receiver_id = ? GROUP BY other_user_id
      ) AS convos ON u.user_id = convos.other_user_id
      JOIN messages m ON 
        ((m.sender_id = convos.other_user_id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = convos.other_user_id))
        AND m.content_sent_at = convos.max_sent_at
      ORDER BY lastMessageTime DESC
    `;
    const [conversations] = await dbConnection.query(query, [myUserId, myUserId, myUserId, myUserId, myUserId]);
    res.json(conversations);
  } catch (err) {
     console.error("Get Conversations Error:", err);
     res.status(500).json({ error: "Failed to get conversations." });
  }
});
app.get('/api/messages/:otherUserId', protectRoute, async (req, res) => {
  try {
    const myUserId = req.user.userId;
    const { otherUserId } = req.params;
    const query = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY content_sent_at ASC
    `;
    const [messages] = await dbConnection.query(query, [myUserId, otherUserId, otherUserId, myUserId]);
    res.json(messages);
  } catch (err) {
     console.error("Get Messages Error:", err);
     res.status(500).json({ error: "Failed to get messages." });
  }
});
app.post('/api/messages', protectRoute, async (req, res) => {
  try {
    const sender_id = req.user.userId;
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) return res.status(400).json({ error: 'Receiver ID and content are required.' });
    const query = 'INSERT INTO messages (sender_id, receiver_id, content, content_sent_at) VALUES (?, ?, ?, NOW())';
    await dbConnection.query(query, [sender_id, receiver_id, content]);
    res.status(201).json({ message: 'Message sent!' });
  } catch (err) {
     console.error("Send Message Error:", err);
     res.status(500).json({ error: "Failed to send message." });
  }
});

// --- NEW CONNECTION MANAGEMENT ENDPOINTS ---
app.get('/api/connections/status/:otherUserId', protectRoute, async (req, res) => {
  const myUserId = req.user.userId;
  const otherUserId = parseInt(req.params.otherUserId);

  if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid user ID." });
  }
  if (myUserId === otherUserId) {
    return res.json({ status: 'same_user' });
  }

  try {
    const connection = await findConnection(myUserId, otherUserId);

    if (!connection) return res.json({ status: 'not_connected' });
    if (connection.status === 1) return res.json({ status: 'connected' });
    // Status is 0 (pending)
    if (connection.connection1_id === myUserId) return res.json({ status: 'pending_sent' });
    else return res.json({ status: 'pending_received' });

  } catch (err) {
    console.error("Get Connection Status Error:", err);
    res.status(500).json({ error: "Failed to get connection status." });
  }
});

app.post('/api/connections/request/:otherUserId', protectRoute, async (req, res) => {
  const myUserId = req.user.userId;
  const otherUserId = parseInt(req.params.otherUserId);

  if (isNaN(otherUserId) || myUserId === otherUserId) {
    return res.status(400).json({ error: "Invalid request." });
  }

  try {
    const existingConnection = await findConnection(myUserId, otherUserId);
    if (existingConnection) return res.status(400).json({ error: "Connection already exists or pending." });

    const query = 'INSERT INTO connections (connection1_id, connection2_id, status, created_at) VALUES (?, ?, 0, NOW())';
    await dbConnection.query(query, [myUserId, otherUserId]);
    res.status(201).json({ status: 'pending_sent' });
  } catch (err) {
    console.error("Send Request Error:", err);
    res.status(500).json({ error: "Failed to send connection request." });
  }
});

app.put('/api/connections/accept/:otherUserId', protectRoute, async (req, res) => {
  const myUserId = req.user.userId;
  const otherUserId = parseInt(req.params.otherUserId);

   if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid user ID." });
  }

  try {
    const connection = await findConnection(myUserId, otherUserId);

    // Ensure request exists, is pending, and was sent TO me
    if (!connection || connection.status !== 0 || connection.connection2_id !== myUserId) {
      return res.status(400).json({ error: "No pending request to accept." });
    }

    const query = 'UPDATE connections SET status = 1 WHERE connection_id = ?';
    await dbConnection.query(query, [connection.connection_id]);
    res.json({ status: 'connected' });
  } catch (err) {
    console.error("Accept Request Error:", err);
    res.status(500).json({ error: "Failed to accept connection request." });
  }
});

app.delete('/api/connections/remove/:otherUserId', protectRoute, async (req, res) => {
  const myUserId = req.user.userId;
  const otherUserId = parseInt(req.params.otherUserId);

   if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid user ID." });
  }

  try {
    const connection = await findConnection(myUserId, otherUserId);
    if (!connection) return res.status(404).json({ error: "Connection not found." });

    const query = 'DELETE FROM connections WHERE connection_id = ?';
    await dbConnection.query(query, [connection.connection_id]);
    res.json({ status: 'not_connected' });
  } catch (err) {
    console.error("Remove Connection Error:", err);
    res.status(500).json({ error: "Failed to remove connection." });
  }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});