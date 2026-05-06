import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { NotificationProvider } from './components/Notification';

// Public pages
import Home from './pages/Home';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// User pages
import MyBids from './pages/MyBids';
import WonAuctions from './pages/WonAuctions';

// Seller pages
import CreateAuction from './pages/seller/CreateAuction';
import ManageAuctions from './pages/seller/ManageAuctions';
import EditAuction from './pages/seller/EditAuction';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/UserManagement';
import AdminAuctions from './pages/admin/AuctionManagement';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/"                  element={<Home />} />
                <Route path="/auctions"          element={<Auctions />} />
                <Route path="/auctions/:id"      element={<AuctionDetail />} />
                <Route path="/login"             element={<Login />} />
                <Route path="/register"          element={<Register />} />

                {/* Authenticated users */}
                <Route element={<ProtectedRoute roles={['user','seller','admin']} />}>
                  <Route path="/my-bids"         element={<MyBids />} />
                  <Route path="/won-auctions"    element={<WonAuctions />} />
                </Route>

                {/* Seller */}
                <Route element={<ProtectedRoute roles={['seller','admin']} />}>
                  <Route path="/seller/create"   element={<CreateAuction />} />
                  <Route path="/seller/auctions" element={<ManageAuctions />} />
                  <Route path="/seller/edit/:id" element={<EditAuction />} />
                </Route>

                {/* Admin */}
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="/admin"           element={<AdminDashboard />} />
                  <Route path="/admin/users"     element={<AdminUsers />} />
                  <Route path="/admin/auctions"  element={<AdminAuctions />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
