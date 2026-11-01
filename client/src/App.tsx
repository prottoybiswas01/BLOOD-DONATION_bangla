import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FirstLoginPasswordModal } from './components/FirstLoginPasswordModal';

// Pages
import { Home } from './pages/Home';
import { DonorSearch } from './pages/DonorSearch';
import { BloodRequests } from './pages/BloodRequests';
import { CreateBloodRequest } from './pages/CreateBloodRequest';
import { DonorRegister } from './pages/DonorRegister';
import { Login } from './pages/Login';
import { DonorDashboard } from './pages/DonorDashboard';
import { RequesterDashboard } from './pages/RequesterDashboard';
import { InstitutionDirectory } from './pages/InstitutionDirectory';
import { InstitutionDetail } from './pages/InstitutionDetail';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { InstitutionHeadDashboard } from './pages/InstitutionHeadDashboard';
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AboutUs } from './pages/AboutUs';
import { ContactHelp } from './pages/ContactHelp';
import { SafetyInfo } from './pages/SafetyInfo';
import { PrivacyTerms } from './pages/PrivacyTerms';
import { ProfileSettings } from './pages/ProfileSettings';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-page text-mainText selection:bg-red-100 selection:text-primary">
          <Navbar />
          <FirstLoginPasswordModal />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/donors" element={<DonorSearch />} />
              <Route path="/requests" element={<BloodRequests />} />
              <Route 
                path="/create-request" 
                element={
                  <ProtectedRoute>
                    <CreateBloodRequest />
                  </ProtectedRoute>
                } 
              />
              <Route path="/institutions" element={<InstitutionDirectory />} />
              <Route path="/institutions/:id" element={<InstitutionDetail />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactHelp />} />
              <Route path="/safety" element={<SafetyInfo />} />
              <Route path="/privacy-terms" element={<PrivacyTerms />} />
              
              {/* Auth Routes */}
              <Route path="/register" element={<DonorRegister />} />
              <Route path="/login" element={<Login />} />

              {/* Profile & Settings (All logged in users) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />

              {/* Protected Dashboards */}
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'MEMBER', 'SUPER_ADMIN']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/requester/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['REQUESTER', 'MEMBER', 'DONOR', 'SUPER_ADMIN']}>
                    <RequesterDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/moderator/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['INSTITUTION_MODERATOR', 'SUPER_ADMIN']}>
                    <ModeratorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/head/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['INSTITUTION_HEAD', 'SUPER_ADMIN']}>
                    <InstitutionHeadDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/coordinator/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['DIVISION_COORDINATOR', 'SUPER_ADMIN']}>
                    <CoordinatorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
