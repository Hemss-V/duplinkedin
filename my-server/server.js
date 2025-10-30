// This is your server.js file
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // <-- ADDED for password hashing

const app = express();
const port = 3001;
const saltRounds = 10; // Standard cost factor for bcrypt

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// --- 2. Database Connection ---
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

// --- 3. JWT Secret ---
const JWT_SECRET = 'your-super-secret-key-123'; // Change this to a random string

// --- 4. Auth Middleware ---
const protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; 
    next(); 
  } catch (ex) {
    console.error("Invalid token:", ex.message);
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// --- 5. API Endpoints ---

// --- AUTH ENDPOINTS ---

// POST /api/register - Register a new user
app.post('/api/register', (req, res) => {
  const { name, email, password, description } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  
  // Hash the password
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Server error during registration.' });
    }

    const query = 'INSERT INTO users (name, email, password, description, headline, summary, age) VALUES (?, ?, ?, ?, "", "", NULL)';
    
    dbConnection.query(query, [name, email, hashedPassword, description], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already exists.' });
        }
        console.error('Database error on register:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  });
});

// POST /api/login - Log in a user
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  dbConnection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error on login:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = results[0];

    // Compare hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing password:', err);
        return res.status(500).json({ error: 'Server error during login.' });
      }

      if (!isMatch) {
        // Passwords don't match
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      // --- Login Successful: Create a JWT ---
      const tokenPayload = {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        description: user.description
      };
      
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: 'Login successful!',
        token: token,
        user: tokenPayload
      });
    });
  });
});

// --- POST ENDPOINTS ---

// GET /api/posts - Get all posts for the feed
app.get('/api/posts', protectRoute, (req, res) => {
  const sortOrder = req.query.sort === 'oldest' ? 'ASC' : 'DESC';

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

// POST /api/posts - Create a new post
app.post('/api/posts', protectRoute, (req, res) => {
  const { content } = req.body;
  const userId = req.userId;

  if (!content) {
    return res.status(400).json({ error: 'Post content is required.' });
  }
  
  const hashtags = ['project', 'update']; // Example
  const postQuery = 'INSERT INTO posts (content, content_sent_at, user_id) VALUES (?, NOW(), ?)';
  
  dbConnection.query(postQuery, [content, userId], (err, results) => {
    if (err) {
      console.error("Database error on post creation:", err);
      return res.status(500).json({ error: err.message });
    }
    
    const postId = results.insertId;
    const hashtagValues = hashtags.map(tag => [tag, postId]);
    const hashtagQuery = 'INSERT INTO hashtags (hashtag, post_id) VALUES ?';

    if (hashtagValues.length > 0) {
      dbConnection.query(hashtagQuery, [hashtagValues], (err_h, results_h) => {
        if (err_h) {
          console.error("Database error on hashtag insertion:", err_h);
        }
        res.status(201).json({ message: 'Post created successfully!', postId: postId });
      });
    } else {
      res.status(201).json({ message: 'Post created successfully!', postId: postId });
    }
  });
});

// GET /api/posts/:postId/hashtags - Get hashtags for a post
app.get('/api/posts/:postId/hashtags', protectRoute, (req, res) => {
  const postId = req.params.postId;
  const query = 'SELECT hashtag FROM hashtags WHERE post_id = ?';
  
  dbConnection.query(query, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET /api/posts/:postId/comments - Get comments for a post
app.get('/api/posts/:postId/comments', protectRoute, (req, res) => {
  const postId = req.params.postId;
  const query = `
    SELECT c.comment_id, c.comment_content, c.created_at, c.commenter_id, u.name
    FROM comments c
    JOIN users u ON c.commenter_id = u.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  
  dbConnection.query(query, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST /api/posts/:postId/comments - Add a comment to a post
app.post('/api/posts/:postId/comments', protectRoute, (req, res) => {
  const postId = req.params.postId;
  const { comment_content } = req.body;
  const commenterId = req.userId;

  if (!comment_content) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }
  
  const query = 'INSERT INTO comments (comment_content, created_at, post_id, commenter_id) VALUES (?, NOW(), ?, ?)';
  
  dbConnection.query(query, [comment_content, postId, commenterId], (err, results) => {
    if (err) {
      console.error("Database error on comment creation:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Comment added!', insertId: results.insertId });
  });
});

// --- USER & PROFILE ENDPOINTS ---

// GET /api/users/:userId - Get a single user's profile
// *** FIXED for connections table ***
app.get('/api/users/:userId', protectRoute, (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.userId; // The person who is VIEWING

  const userQuery = 'SELECT user_id, name, headline, summary, description FROM users WHERE user_id = ?';
  const connectionQuery = `
    SELECT status
    FROM connections
    WHERE (connection1_id = ? AND connection2_id = ?) OR (connection1_id = ? AND connection2_id = ?)
  `;
  
  dbConnection.query(userQuery, [userId], (err, userResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (userResults.length === 0) return res.status(404).json({ error: 'User not found' });

    const userProfile = userResults[0];

    if (parseInt(userId) === currentUserId) {
      userProfile.connectionStatus = 'self';
      return res.json(userProfile);
    }
    
    dbConnection.query(connectionQuery, [currentUserId, userId, userId, currentUserId], (err, connectionResults) => {
      if (err) return res.status(500).json({ error: err.message });

      if (connectionResults.length === 0) {
        userProfile.connectionStatus = 'not_connected';
      } else {
        const status = connectionResults[0].status;
        
        // This assumes 'status' is a string 'pending' or 'accepted'.
        // If 'status' is tinyint (e.g., 0=pending, 1=accepted), this logic must change.
        if (status === 'accepted') {
          userProfile.connectionStatus = 'connected';
        } else if (status === 'pending') {
          const pendingQuery = 'SELECT connection1_id FROM connections WHERE (connection1_id = ? AND connection2_id = ?) AND status = "pending"';
          
          dbConnection.query(pendingQuery, [currentUserId, userId], (err, pendingResults) => {
            if (err) return res.status(500).json({ error: err.message });
            if (pendingResults.length > 0) {
              userProfile.connectionStatus = 'pending_sent';
            } else {
              userProfile.connectionStatus = 'pending_received';
            }
            res.json(userProfile);
          });
        }
      }
      if (!userProfile.connectionStatus) {
         res.json(userProfile);
      }
    });
  });
});

// GET /api/users/:userId/connections - Get connection count
// *** FIXED for connections table ***
app.get('/api/users/:userId/connections', protectRoute, (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT COUNT(*) as count 
    FROM connections 
    WHERE (connection1_id = ? OR connection2_id = ?) AND status = 'accepted'
  `;
  dbConnection.query(query, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// --- CONNECTION ENDPOINTS ---

// GET /api/connections - Get all *accepted* connections for the logged-in user
// *** FIXED for connections table ***
app.get('/api/connections', protectRoute, (req, res) => {
  const userId = req.userId;
  const query = `
    SELECT u.user_id, u.name, u.headline
    FROM users u
    JOIN connections c ON (u.user_id = c.connection2_id OR u.user_id = c.connection1_id)
    WHERE (c.connection1_id = ? OR c.connection2_id = ?) AND c.status = 'accepted' AND u.user_id != ?
  `;
  
  dbConnection.query(query, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /api/connections/all - Get ALL users and their connection status
// *** FIXED for connections table ***
app.get('/api/connections/all', protectRoute, (req, res) => {
  const userId = req.userId;
  const query = `
    SELECT 
      u.user_id, 
      u.name, 
      u.headline,
      c.status,
      CASE WHEN c.connection1_id = ? THEN 'sent' ELSE 'received' END as request_direction
    FROM users u
    LEFT JOIN connections c 
      ON (c.connection1_id = u.user_id AND c.connection2_id = ?) OR (c.connection1_id = ? AND c.connection2_id = u.user_id)
    WHERE u.user_id != ?
  `;
  
  dbConnection.query(query, [userId, userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const processedResults = results.map(user => {
      let connectionStatus = 'not_connected';
      if (user.status === 'accepted') {
        connectionStatus = 'connected';
      } else if (user.status === 'pending') {
        connectionStatus = user.request_direction === 'sent' ? 'pending_received' : 'pending_sent';
      }
      return {
        user_id: user.user_id,
        name: user.name,
        headline: user.headline,
        status: connectionStatus
      };
    });
    res.json(processedResults);
  });
});

// POST /api/connections/request - Send a connection request
// *** FIXED for connections table ***
app.post('/api/connections/request', protectRoute, (req, res) => {
  const requesterId = req.userId;
  const { receiverId } = req.body;

  if (requesterId === receiverId) {
    return res.status(400).json({ error: 'Cannot connect with yourself.' });
  }

  // We assume connection1_id is requester, connection2_id is receiver
  // Added created_at column from your schema
  const query = 'INSERT INTO connections (connection1_id, connection2_id, status, created_at) VALUES (?, ?, "pending", NOW())';
  
  dbConnection.query(query, [requesterId, receiverId], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Connection request already exists.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Connection request sent.' });
  });
});

// POST /api/connections/accept - Accept a connection request
// *** FIXED for connections table ***
app.post('/api/connections/accept', protectRoute, (req, res) => {
  const receiverId = req.userId; // You are the receiver
  const { requesterId } = req.body; // The person who sent it
  
  // We must find the request where connection1_id sent it AND connection2_id is you
  const query = 'UPDATE connections SET status = "accepted" WHERE connection1_id = ? AND connection2_id = ? AND status = "pending"';
  
  dbConnection.query(query, [requesterId, receiverId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No pending request found.' });
    }
    res.json({ message: 'Connection accepted.' });
  });
});


// --- MESSAGING ENDPOINTS ---

// GET /api/messages/conversations - Get list of users the logged-in user has chatted with
app.get('/api/messages/conversations', protectRoute, (req, res) => {
  const userId = req.userId;
  const query = `
    WITH UserConversations AS (
      SELECT 
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END AS other_user_id
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY other_user_id
    )
    SELECT 
      uc.other_user_id AS user_id, 
      u.name, 
      (SELECT content 
       FROM messages 
       WHERE (sender_id = ? AND receiver_id = uc.other_user_id) OR (sender_id = uc.other_user_id AND receiver_id = ?)
       ORDER BY content_sent_at DESC
       LIMIT 1) AS last_message
    FROM UserConversations uc
    JOIN users u ON uc.other_user_id = u.user_id
  `;

  dbConnection.query(query, [userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching conversations:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET /api/messages/:otherUserId - Get message history with a specific user
app.get('/api/messages/:otherUserId', protectRoute, (req, res) => {
  const userId = req.userId;
  const otherUserId = req.params.otherUserId;

  const query = `
    SELECT message_id, content, content_sent_at, sender_id, receiver_id
    FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY content_sent_at ASC
  `;
  
  dbConnection.query(query, [userId, otherUserId, otherUserId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST /api/messages - Send a new message
app.post('/api/messages', protectRoute, (req, res) => {
  const senderId = req.userId;
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Receiver ID and content are required.' });
  }

  const query = 'INSERT INTO messages (content, content_sent_at, sender_id, receiver_id) VALUES (?, NOW(), ?, ?)';
  
  dbConnection.query(query, [content, senderId, receiverId], (err, results) => {
    if (err) {
      console.error('Error sending message:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message_id: results.insertId,
      content: content,
      content_sent_at: new Date().toISOString(),
      sender_id: senderId,
      receiver_id: parseInt(receiverId)
    });
  });
});

// --- 6. Start the Server ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});