import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts } from '../services/mockStorage';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerInfo, setSellerInfo] = useState<{name: string, avatar?: string} | null>(null);

  useEffect(() => {
    const load = async () => {
      if(id) {
        const all = await getProducts({ sellerId: id });
        setProducts(all);
        if(all.length > 0) {
           setSellerInfo({
             name: all[0].sellerNickname,
             avatar: all[0].sellerAvatar
           });
        } else {
           // Fallback if seller has no active products but exists (not implemented in mock for simplicity)
           setSellerInfo({ name: 'Seller', avatar: '' }); 
        }
      }
    };
    load();
  }, [id]);

  if (!sellerInfo) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200">
         <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-6">
            <img 
              src={sellerInfo.avatar || `https://ui-avatars.com/api/?name=${sellerInfo.name}`} 
              className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-lg" 
              alt={sellerInfo.name} 
            />
            <div className="text-center md:text-left">
               <h1 className="text-2xl font-bold text-slate-900">{sellerInfo.name}</h1>
               <p className="text-slate-500 mt-1">上架商品: {products.length}</p>
               {/* In a real app, we'd fetch User object to get social links here. Mocking display: */}
               <div className="flex gap-3 mt-4 justify-center md:justify-start">
                  <div className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-pink-500 hover:bg-pink-50 transition-colors cursor-pointer"><Instagram className="w-5 h-5"/></div>
                  <div className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"><Facebook className="w-5 h-5"/></div>
                  <div className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors cursor-pointer"><MessageCircle className="w-5 h-5"/></div>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
         <h2 className="text-lg font-bold text-slate-800 mb-6">賣場商品</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
         </div>
         {products.length === 0 && <p className="text-center text-slate-400">此賣場目前沒有上架商品</p>}
      </div>
    </div>
  );
};

export default SellerProfile;
