import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/mockStorage';
import { ShoppingBag } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState(''); // Only for register
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await loginUser(email);
      } else {
        if (!nickname) throw new Error("請輸入暱稱");
        await registerUser(email, nickname);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || "操作失敗");
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-indigo-500/20">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isLogin ? '歡迎回到 uni' : '加入 uni'}</h1>
          <p className="text-slate-500 text-sm mt-2">二手選物，質感生活</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              required
              className={inputClasses}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">暱稱</label>
              <input
                type="text"
                required
                className={inputClasses}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="您的顯示名稱"
              />
            </div>
          )}

          {/* Mock Password Field (Visual only as per mockAuth) */}
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">密碼</label>
            <input
              type="password"
              required
              className={inputClasses}
              defaultValue="password123"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-slate-900/20 mt-2"
          >
            {isLogin ? '登入' : '註冊'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-primary transition-colors font-medium"
          >
            {isLogin ? '還沒有帳號？立即註冊' : '已經有帳號？立即登入'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
           <p className="text-xs text-slate-400">Demo Account: demo@uni.com</p>
        </div>
      </div>
    </div>
  );
};

export default Login;