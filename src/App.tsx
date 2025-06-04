import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tutorial from './components/Tutorial';
import Demo from './components/Demo';
import Security from './components/Security';
import X3DHDemo from './components/X3DHDemo';

const App: React.FC = () => {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Diffie-Hellman Learning</Link>
            <div className="navbar-nav">
              <Link className="nav-link" to="/">Tutorial</Link>
              <Link className="nav-link" to="/demo">Diffie-Hellman</Link>
              <Link className="nav-link" to="/x3dhdemo">X3DH</Link>
              <Link className="nav-link" to="/security">Security</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Tutorial />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/x3dhdemo" element={<X3DHDemo />} />
          <Route path="/security" element={<Security />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 