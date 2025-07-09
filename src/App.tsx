import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Navigation from './components/Navigation';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div 
          className="min-h-screen transition-all duration-500" 
          style={{ background: 'var(--background-color, #FAFBFC)' }}
        >
          <Navigation />
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;