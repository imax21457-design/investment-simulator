const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-key-change-me';
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Initialize local "database" fallback
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }));
}

const readDBLocal = () => JSON.parse(fs.readFileSync(DB_PATH));
const writeDBLocal = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_URL !== 'your-supabase-url' && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY !== 'your-supabase-service-role-key') {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('Supabase client initialized successfully.');
} else {
  console.warn('Supabase credentials not fully configured. Running in mock/local mode.');
}

// Database Helpers
const getUserByUsername = async (username) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error fetching user by username:', error);
    }
    return data || null;
  } else {
    const db = readDBLocal();
    return db.users.find(u => u.username === username) || null;
  }
};

const getUserById = async (id) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error fetching user by id:', error);
    }
    return data || null;
  } else {
    const db = readDBLocal();
    return db.users.find(u => u.id === id) || null;
  }
};

const createUser = async (newUser) => {
  if (supabase) {
    const { error } = await supabase
      .from('users')
      .insert({
        id: newUser.id,
        username: newUser.username,
        password: newUser.password,
        game_state: newUser.gameState
      });
    if (error) {
      throw new Error(`Supabase registration failed: ${error.message}`);
    }
  } else {
    const db = readDBLocal();
    db.users.push(newUser);
    writeDBLocal(db);
  }
};

const updateGameState = async (userId, gameState) => {
  if (supabase) {
    const { error } = await supabase
      .from('users')
      .update({ game_state: gameState })
      .eq('id', userId);
    if (error) {
      throw new Error(`Supabase save game state failed: ${error.message}`);
    }
  } else {
    const db = readDBLocal();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].gameState = gameState;
      writeDBLocal(db);
    } else {
      throw new Error('User not found');
    }
  }
};

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      gameState: null
    };

    await createUser(newUser);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

app.get('/api/game-state', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.gameState !== undefined ? user.gameState : user.game_state);
  } catch (err) {
    console.error('Get game-state error:', err);
    res.status(500).json({ message: 'Internal server error fetching game state' });
  }
});

app.post('/api/game-state', authenticateToken, async (req, res) => {
  try {
    await updateGameState(req.user.id, req.body);
    res.json({ message: 'Game state saved' });
  } catch (err) {
    console.error('Save game-state error:', err);
    res.status(500).json({ message: 'Internal server error saving game state' });
  }
});

// Serve static files from the React frontend build directory
const DIST_PATH = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
  console.log('Serving frontend from production build.');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

