
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getCurrentUser, deleteProduct, getComments, addComment } from '../services/mockStorage';
import { Product, User, ProductCondition, Comment } from '../types';
import { ArrowLeft, Tag, Instagram, Facebook, MessageCircle, Trash2, Sparkles, Edit, Send, MessageSquare } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        try {
          const p = await getProductById(id);
          setProduct(p);
          await loadComments(id);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
    setCurrentUser(getCurrentUser());
  }, [id]);

  const loadComments = async (productId: string) => {
    const data = await getComments(productId);
    setComments(data);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) {
        alert("錯誤：找不到商品 ID");
        return;
    }
    
    if (window.confirm('確定要刪除此商品嗎？此動作無法復原。')) {
       try {
          await deleteProduct(id);
          navigate('/');
       } catch (error: any) {
          console.error(error);
          alert('刪除失敗: ' + (error.message || '未知錯誤'));
       }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    
    try {
      await addComment(id, newComment);
      setNewComment('');
      await loadComments(id);
    } catch (error) {
      alert('請先登入才能留言');
      navigate('/login');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center text-slate-500">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <p className="text-lg text-slate-600 mb-4">找不到此商品，可能已被刪除。</p>
        <Link to="/" className="px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors">
          回首頁
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === product.sellerId;

  // Condition UI helpers
  const conditionBadge = (c: ProductCondition) => {
     const styles = {
        NEW: 'bg-green-500 text-white',
        LIKE_NEW: 'bg-blue-500 text-white',
        GOOD: 'bg-yellow-500 text-white',
        FAIR: 'bg-orange-500 text-white'
     };
     const labels = { NEW: '全新', LIKE_NEW: '近全新', GOOD: '良好', FAIR: '功能正常' };
     return <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles[c]}`}>{labels[c]}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Nav overlay */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center">
         <Link to="/" className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5"/></Link>
         <span className="ml-2 font-bold text-slate-700 truncate">{product.title}</span>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-contain bg-black/5" />
          </div>
          {product.images.length > 1 && (
             <div className="flex gap-2 overflow-x-auto pb-2">
               {product.images.map((img, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => setActiveImage(idx)}
                   className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent opacity-70'}`}
                 >
                   <img src={img} className="w-full h-full object-cover" alt="thumb"/>
                 </button>
               ))}
             </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
           <div>
             <div className="flex items-center justify-between mb-2">
               {conditionBadge(product.condition)}
               <span className="text-sm text-slate-400">{new Date(product.createdAt).toLocaleDateString()} 上架</span>
             </div>
             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{product.title}</h1>
             <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">NT$ {product.price.toLocaleString()}</span>
             </div>
           </div>

           {/* AI Note - Visible only to owner */}
           {isOwner && product.priceNote && (
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 relative">
                <div className="absolute -top-3 -left-2 bg-white rounded-full p-1 border border-indigo-100 shadow-sm">
                   <Sparkles className="w-5 h-5 text-indigo-500" fill="currentColor" />
                </div>
                <p className="text-sm text-indigo-900 pl-4 pt-1 leading-relaxed">
                   <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-indigo-400">Gemini AI 分析</span>
                   {product.priceNote}
                </p>
             </div>
           )}

           {/* Description */}
           <div className="prose prose-slate max-w-none">
             <h3 className="text-lg font-semibold text-slate-800 mb-2">商品描述</h3>
             <p className="text-slate-600 whitespace-pre-line">{product.description}</p>
           </div>

           {/* Tags */}
           <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                   <Tag className="w-3 h-3 mr-1" /> {tag}
                </span>
              ))}
           </div>

           <div className="border-t border-slate-200 pt-6"></div>

           {/* Seller Section */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <Link to={`/seller/${product.sellerId}`} className="flex items-center gap-3">
                 <img src={product.sellerAvatar || `https://ui-avatars.com/api/?name=${product.sellerNickname}`} className="w-12 h-12 rounded-full border border-slate-100" alt="seller"/>
                 <div>
                    <p className="font-bold text-slate-800">{product.sellerNickname}</p>
                    <p className="text-xs text-slate-500">點擊查看賣場</p>
                 </div>
              </Link>
              
              {isOwner ? (
                 <div className="flex gap-2">
                   <Link to={`/edit/${product.id}`} className="bg-slate-100 text-slate-600 hover:bg-slate-200 p-2 rounded-lg transition-colors flex flex-col items-center text-xs min-w-[60px]">
                      <Edit className="w-5 h-5 mb-1" /> 編輯
                   </Link>
                   <button type="button" onClick={handleDelete} className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors flex flex-col items-center text-xs min-w-[60px]">
                      <Trash2 className="w-5 h-5 mb-1" /> 刪除
                   </button>
                 </div>
              ) : currentUser ? (
                 <div className="flex gap-2">
                     {/* Mock social buttons - In real app, check user.socialLinks */}
                     <button className="p-2 bg-slate-100 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5"/></button>
                     <button className="p-2 bg-slate-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"><Facebook className="w-5 h-5"/></button>
                     <button className="p-2 bg-slate-100 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"><MessageCircle className="w-5 h-5"/></button>
                 </div>
              ) : (
                <div className="text-xs text-slate-400">
                   登入後查看聯絡資訊
                </div>
              )}
           </div>
        </div>

        {/* Comments Section - Full Width */}
        <div className="md:col-span-2 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              商品留言 ({comments.length})
            </h3>

            {/* Comment List */}
            <div className="space-y-6 mb-8">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <img 
                      src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.userNickname}`} 
                      alt={comment.userNickname}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{comment.userNickname}</span>
                        <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                        {comment.userId === product.sellerId && (
                           <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">賣家</span>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 text-slate-700 text-sm leading-relaxed group-hover:bg-slate-100 transition-colors">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p>目前還沒有留言，成為第一個提問的人吧！</p>
                </div>
              )}
            </div>

            {/* Comment Form */}
            <div className="border-t border-slate-100 pt-6">
              {currentUser ? (
                <form onSubmit={handleSubmitComment} className="flex gap-4">
                   <img 
                      src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.nickname}`} 
                      alt="My Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 hidden sm:block"
                    />
                   <div className="flex-1 relative">
                      <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="對商品有疑問嗎？留言詢問賣家..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none resize-none min-h-[50px]"
                        rows={2}
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 bottom-2.5 bg-slate-900 text-white p-1.5 rounded-lg hover:bg-primary disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                   </div>
                </form>
              ) : (
                <div className="text-center bg-slate-50 rounded-xl p-4">
                  <Link to="/login" className="text-primary font-bold hover:underline">登入</Link>
                  <span className="text-slate-500"> 後即可參與討論</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;