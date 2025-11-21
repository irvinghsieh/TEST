import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, PlusCircle, ShoppingBag } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../services/mockStorage';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">uni <span className="hidden sm:inline text-slate-500 text-sm font-normal">二手選物</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/sell" 
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">上架</span>
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    <img 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.nickname}&background=random`} 
                      alt="Avatar" 
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">個人檔案</Link>
                    <Link to={`/seller/${user.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">我的賣場</Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> 登出
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-slate-600 hover:text-primary font-medium text-sm"
              >
                登入 / 註冊
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
