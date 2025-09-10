import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const LearnerPortal = lazy(() => import('./components/learner/LearnerPortal'));
const HomePage = lazy(() => import('./components/HomePage'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/portal" element={<LearnerPortal />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;