import React, { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Nav from './components/Nav';
const Home = lazy(() => import('./pages/Home'));
const Todos = lazy(() => import('./pages/Todos'));

function App() {
  return (
    // 路由接管一切
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Todos" element={<Todos />} />
      </Routes>
    </Router>
  )
}

export default App