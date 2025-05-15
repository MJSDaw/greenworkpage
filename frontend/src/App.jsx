import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Spaces from './pages/Spaces'
import About from './pages/About'
import Contact from './pages/Contact'
import Signin from './pages/Signin'
import Login from './pages/Login'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

const App = () => {
  return (
    <Router>
      <Header />
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </>
      <Footer />
    </Router>
  )
}

export default App
