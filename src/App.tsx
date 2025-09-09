import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Programs from './components/Programs';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const LearnerPortal = lazy(() => import('./components/learner/LearnerPortal'));

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
            <Route path="/" element={
              <>
                <Header />
                <Hero />
                <Features />
                <Programs />
                <About />
                <Contact />
                <Footer />
              </>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;