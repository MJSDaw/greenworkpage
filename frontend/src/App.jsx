import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Spaces from './pages/Spaces'
import About from './pages/About'
import Contact from './pages/Contact'
import Signin from './pages/Signin'
import Login from './pages/Login'

const App = () => {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
