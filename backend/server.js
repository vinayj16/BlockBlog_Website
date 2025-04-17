const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',  
  host: 'localhost',                
  database: 'user_auth_db',    
  password: '01466', 
  port: 5432,                        
});

pool.connect(err => {
  if (err) {
    console.error('Database connection error', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, password]
    );
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not found.' });
    }

    const resetToken = generateResetToken(user);

    await sendResetEmail(email, resetToken);

    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});