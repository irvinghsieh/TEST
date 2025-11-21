import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUserProfile } from '../services/mockStorage';
import { User } from '../types';
import { Instagram, Facebook, MessageCircle, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [line, setLine] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setNickname(u.nickname);
      setInstagram(u.socialLinks?.instagram || '');
      setFacebook(u.socialLinks?.facebook || '');
      setLine(u.socialLinks?.line || '');
    }
  }, []);

  const handleSave = async () => {
    if (!user) return;
    try {
      const updated = await updateUserProfile({
        nickname,
        socialLinks: { instagram, facebook, line }
      });
      setUser(updated);
      setMessage('儲存成功！');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('儲存失敗');
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-white";

  if (!user) return <div className="p-10 text-center">請先登入</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
       <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 h-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20"></div>
          </div>
          <div className="px-8 relative">
             <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <img 
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.nickname}`} 
                  className="w-24 h-24 rounded-full border-[4px] border-white shadow-md bg-white object-cover" 
                  alt="avatar"
                />
             </div>
          </div>
          
          <div className="mt-16 px-8 pb-10 space-y-7">
             <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-slate-800">{user.email}</h1>
                <p className="text-sm text-slate-400 font-mono bg-slate-50 inline-block px-2 py-0.5 rounded-full mt-1">ID: {user.id}</p>
             </div>

             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">顯示暱稱</label>
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={e => setNickname(e.target.value)}
                  className={inputClasses}
                />
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">社群連結 (選填)</label>
                   <p className="text-xs text-slate-400 mb-3 ml-1">這些資訊將公開在您的賣場頁面，方便買家聯繫。</p>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-5 h-5 text-pink-600" />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Instagram ID"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      className={`${inputClasses} text-sm`}
                   />
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Facebook className="w-5 h-5 text-blue-600" />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Facebook Profile URL"
                      value={facebook}
                      onChange={e => setFacebook(e.target.value)}
                      className={`${inputClasses} text-sm`}
                   />
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Line ID"
                      value={line}
                      onChange={e => setLine(e.target.value)}
                      className={`${inputClasses} text-sm`}
                   />
                </div>
             </div>

             {message && <div className="text-center text-green-600 text-sm font-medium bg-green-50 py-3 rounded-xl border border-green-100 animate-fade-in">{message}</div>}

             <button 
               onClick={handleSave}
               className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20 mt-2"
             >
               <Save className="w-4 h-4" /> 儲存設定
             </button>
          </div>
       </div>
    </div>
  );
};

export default Profile;