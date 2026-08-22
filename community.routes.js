import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLocalStore } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Get Community Feed (Screen 10)
router.get('/posts', (req, res) => {
  try {
    const { q, sort } = req.query;
    const store = getLocalStore();
    let posts = [...(store.community_posts || [])];

    // Enrich posts with author and trip details
    let enriched = posts.map(post => {
      const user = (store.users || []).find(u => u.id === post.user_id);
      const trip = post.trip_id ? (store.trips || []).find(t => t.id === post.trip_id) : null;

      return {
        ...post,
        author: {
          id: user ? user.id : 'unknown',
          name: user ? `${user.first_name} ${user.last_name}` : 'GlobeTrotter Explorer',
          photo_url: user ? user.photo_url : 'https://api.dicebear.com/7.x/avataaars/svg?seed=traveler',
          city: user ? user.city : '',
          country: user ? user.country : ''
        },
        trip: trip ? {
          id: trip.id,
          name: trip.name,
          share_slug: trip.share_slug,
          cover_photo_url: trip.cover_photo_url
        } : null
      };
    });

    if (q) {
      const search = q.toLowerCase();
      enriched = enriched.filter(p => 
        p.content.toLowerCase().includes(search) ||
        p.author.name.toLowerCase().includes(search) ||
        (p.trip && p.trip.name.toLowerCase().includes(search))
      );
    }

    if (sort === 'popular') {
      enriched.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else {
      // Default newest first
      enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({ posts: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch community posts.' });
  }
});

// 2. Create Community Post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content, image_url, trip_id } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content cannot be empty.' });
    }

    const store = getLocalStore();
    const newPost = {
      id: uuidv4(),
      user_id: req.user.id,
      trip_id: trip_id || null,
      content: content.trim(),
      image_url: image_url || null,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    store.community_posts.unshift(newPost);

    const trip = newPost.trip_id ? (store.trips || []).find(t => t.id === newPost.trip_id) : null;
    const author = {
      id: req.user.id,
      name: `${req.user.first_name} ${req.user.last_name}`,
      photo_url: req.user.photo_url,
      city: req.user.city,
      country: req.user.country
    };

    res.status(201).json({
      message: 'Post created successfully!',
      post: {
        ...newPost,
        author,
        trip: trip ? { id: trip.id, name: trip.name, share_slug: trip.share_slug } : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// 3. Like a post
router.post('/posts/:id/like', authenticateToken, (req, res) => {
  try {
    const store = getLocalStore();
    const post = (store.community_posts || []).find(p => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    post.likes_count = (post.likes_count || 0) + 1;
    res.json({ message: 'Post liked!', likes_count: post.likes_count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post.' });
  }
});

export default router;
