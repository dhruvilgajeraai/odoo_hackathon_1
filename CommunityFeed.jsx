import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import TopBar from '../components/common/TopBar';
import { 
  Heart, MessageSquare, Share2, Plus, MapPin, 
  Sparkles, Compass, Users, Image, X, Check, Globe 
} from 'lucide-react';

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // TopBar state
  const [search, setSearch] = useState('');
  const [selectedSort, setSelectedSort] = useState('');

  // New post modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTripId, setNewTripId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const samplePostImages = [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80'
  ];

  const loadPosts = async () => {
    try {
      const [postsRes, tripsRes] = await Promise.all([
        api.getCommunityPosts({ q: search, sort: selectedSort }),
        api.getTrips({ user: 'me' })
      ]);
      setPosts(postsRes.posts || []);
      setUserTrips(tripsRes.trips || []);
    } catch (err) {
      console.error('Failed to load community feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [search, selectedSort]);

  const handleLike = async (postId) => {
    try {
      const res = await api.likeCommunityPost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: res.likes_count } : p));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      await api.createCommunityPost({
        content: newContent,
        image_url: newImageUrl || samplePostImages[0],
        trip_id: newTripId || null
      });
      setCreateOpen(false);
      setNewContent('');
      setNewImageUrl('');
      setNewTripId('');
      loadPosts();
    } catch (err) {
      alert(err.message || 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest Stories' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community Stories & Insights</h1>
          <p className="text-sm text-slate-500">
            Share your travel experiences, recommendations, and connect with global explorers.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Share Experience</span>
        </button>
      </div>

      {/* Cross-Screen TopBar */}
      <TopBar
        searchPlaceholder="Search community posts by keyword, author, or city..."
        searchValue={search}
        onSearchChange={setSearch}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* Main Grid: Left = Feed Posts, Right = Community Guide Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts Stream (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No community posts yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to share an unforgettable sunset, hiking tip, or local food discovery!
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                className="bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`}
                      alt={post.author?.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500/20"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{post.author?.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {post.author?.city ? `${post.author.city}, ` : ''}{post.author?.country || 'World Explorer'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {post.content}
                </p>

                {/* Image */}
                {post.image_url && (
                  <div className="rounded-2xl overflow-hidden max-h-96 w-full shadow-inner border border-slate-100">
                    <img
                      src={post.image_url}
                      alt="Story"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Linked Trip Badge (if linked) */}
                {post.trip && (
                  <Link
                    to={`/t/${post.trip.share_slug}`}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Linked Itinerary: {post.trip.name}</span>
                  </Link>
                )}

                {/* Actions & Likes */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors font-bold text-slate-600"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>{post.likes_count || 0} Likes</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Info Panel (Wireframe Screen 10 Requirement) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Sparkles className="w-5 h-5" />
            </div>

            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              About the Community Section
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Community section where all the users can share their experience about a certain trip or activity. 
              Using the search, groupby or filter and sortby options, you can narrow down travel tips, hidden gems, 
              and authentic recommendations from fellow globetrotters.
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Link public itineraries to posts</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Discover authentic local recommendations</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>One-click copy shared trips</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Share Your Travel Experience</h3>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600">Your Story / Tips *</label>
                <textarea
                  required
                  rows="4"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share a story, hidden culinary gem, travel advice, or itinerary highlight..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-600">Cover Image URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />

                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Or pick sample:</span>
                  <div className="flex space-x-1.5">
                    {samplePostImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewImageUrl(img)}
                        className={`w-8 h-8 rounded-lg overflow-hidden border ${newImageUrl === img ? 'border-brand-600 ring-2 ring-brand-500/30' : 'border-slate-200 opacity-70'}`}
                      >
                        <img src={img} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {userTrips.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600">Link to One of Your Trips (Optional)</label>
                  <select
                    value={newTripId}
                    onChange={(e) => setNewTripId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">-- Do not link trip --</option>
                    {userTrips.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-600 text-white py-3 rounded-2xl font-bold text-sm shadow-md hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Publish Experience'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
