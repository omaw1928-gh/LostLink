import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Workspace Pages
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import MyReports from './pages/MyReports';
import MyClaims from './pages/MyClaims';
import Profile from './pages/Profile';

// Admin Console Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminItems from './pages/AdminItems';
import AdminUsers from './pages/AdminUsers';
import AdminClaims from './pages/AdminClaims';

function App() {
  return (
    <Routes>
      {/* Public Pages with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Authenticated Student Dashboard & Workspace */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-lost" element={<ReportItem />} />
        <Route path="/report-found" element={<ReportItem />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Only Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items"
          element={
            <ProtectedRoute adminOnly>
              <AdminItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/claims"
          element={
            <ProtectedRoute adminOnly>
              <AdminClaims />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
