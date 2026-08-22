import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, Map, Calendar, Users, Shield, Plus, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'My Trips', path: '/trips', icon: Map },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-brand-700 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 ml-6">
              {user && navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/trips/new"
                  className="hidden sm:inline-flex items-center space-x-1.5 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan a Trip</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <img
                      src={user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}`}
                      alt={user.first_name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30"
                    />
                    <span className="hidden lg:block text-sm font-semibold text-slate-800">
                      {user.first_name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        to="/trips"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <Map className="w-4 h-4" />
                        <span>My Trips</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {user && navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 text-brand-600" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          {user && (
            <Link
              to="/trips/new"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full mt-3 bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Plan a Trip</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
