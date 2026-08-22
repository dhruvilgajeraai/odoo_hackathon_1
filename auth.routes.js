import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, getLocalStore, saveLocalStore, isPostgres } from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, city, country, bio, photo_url } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    }

    // Check existing email
    const existing = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered. Please login.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    const defaultPhoto = photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(first_name + ' ' + last_name)}`;

    const newUser = {
      id: userId,
      email: email.toLowerCase().trim(),
      password_hash,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone || '',
      city: city || '',
      country: country || '',
      bio: bio || '',
      role: 'user',
      photo_url: defaultPhoto,
      created_at: new Date().toISOString()
    };

    if (isPostgres) {
      await query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, city, country, bio, role, photo_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [newUser.id, newUser.email, newUser.password_hash, newUser.first_name, newUser.last_name, newUser.phone, newUser.city, newUser.country, newUser.bio, newUser.role, newUser.photo_url, newUser.created_at]
      );
    } else {
      const store = getLocalStore();
      store.users.push(newUser);
      saveLocalStore();
    }

    const token = generateToken(newUser);
    const userResponse = { ...newUser };
    delete userResponse.password_hash;

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    let user = null;
    if (isPostgres) {
      const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (result.rows.length > 0) user = result.rows[0];
    } else {
      const store = getLocalStore();
      user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    }

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, String(user.password_hash));
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const userResponse = { ...user };
    delete userResponse.password_hash;

    res.json({
      message: 'Login successful!',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// Get current user profile & stats
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const store = getLocalStore();
    const userTrips = isPostgres 
      ? (await query('SELECT * FROM trips WHERE user_id = $1', [req.user.id])).rows
      : (store.trips || []).filter(t => t.user_id === req.user.id);

    const completedTrips = userTrips.filter(t => new Date(t.end_date) < new Date());
    const upcomingTrips = userTrips.filter(t => new Date(t.start_date) >= new Date());

    res.json({
      user: req.user,
      stats: {
        total_trips: userTrips.length,
        upcoming_trips: upcomingTrips.length,
        completed_trips: completedTrips.length
      }
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to load user profile.' });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone, city, country, bio, photo_url } = req.body;

    if (isPostgres) {
      await query(
        `UPDATE users
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone),
             city = COALESCE($4, city),
             country = COALESCE($5, country),
             bio = COALESCE($6, bio),
             photo_url = COALESCE($7, photo_url)
         WHERE id = $8`,
        [first_name, last_name, phone, city, country, bio, photo_url, req.user.id]
      );
    } else {
      const store = getLocalStore();
      const user = store.users.find(u => u.id === req.user.id);
      if (user) {
        if (first_name !== undefined) user.first_name = first_name;
        if (last_name !== undefined) user.last_name = last_name;
        if (phone !== undefined) user.phone = phone;
        if (city !== undefined) user.city = city;
        if (country !== undefined) user.country = country;
        if (bio !== undefined) user.bio = bio;
        if (photo_url !== undefined) user.photo_url = photo_url;
        saveLocalStore();
      }
    }

    const updatedUser = isPostgres 
      ? (await query('SELECT * FROM users WHERE id = $1', [req.user.id])).rows[0]
      : getLocalStore().users.find(u => u.id === req.user.id);

    delete updatedUser.password_hash;
    res.json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
