
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Sell from './pages/Sell';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import SellerProfile from './pages/SellerProfile';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="font-sans text-slate-900 antialiased">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/edit/:id" element={<Sell />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/seller/:id" element={<SellerProfile />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
