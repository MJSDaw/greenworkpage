import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Spaces from './pages/Spaces'
import Space from './pages/Space'
import About from './pages/About'
import Contact from './pages/Contact'
import Signin from './pages/Signin'
import Login from './pages/Login'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="app__content">          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spaces" element={<Spaces />} />
            <Route path="/space/:id" element={<Space />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={
              <ProtectedRoute userType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user" element={
              <ProtectedRoute userType="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  )
}

export default App
