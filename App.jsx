import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';

// 13 Screen Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import BuildItinerary from './pages/BuildItinerary';
import MyTrips from './pages/MyTrips';
import Profile from './pages/Profile';
import SearchExplore from './pages/SearchExplore';
import ItineraryView from './pages/ItineraryView';
import CommunityFeed from './pages/CommunityFeed';
import CalendarView from './pages/CalendarView';
import AdminPanel from './pages/AdminPanel';
import PublicTripView from './pages/PublicTripView';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/t/:share_slug" element={<PublicTripView />} />

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/trips" element={<MyTrips />} />
                <Route path="/trips/new" element={<CreateTrip />} />
                <Route path="/trips/:id" element={<ItineraryView />} />
                <Route path="/trips/:id/build" element={<BuildItinerary />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/explore" element={<SearchExplore />} />
                <Route path="/search" element={<SearchExplore />} />
                <Route path="/community" element={<CommunityFeed />} />
                <Route path="/calendar" element={<CalendarView />} />
              </Route>

              {/* Admin Only Route */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} GlobeTrotter Inc. Smart Multi-City Travel Planning & Expense Management.</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
