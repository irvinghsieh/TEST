import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/mockStorage';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
         
         <div className="max-w-5xl mx-auto relative z-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">探索獨一無二的珍藏</h1>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">透過 AI 智能分析，輕鬆上架您的二手好物。uni 讓每一次的循環流動都變得更有價值。</p>
            
            <div className="max-w-md mx-auto relative">
              <input 
                type="text" 
                placeholder="搜尋商品、標籤..." 
                className="w-full py-3 pl-12 pr-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            </div>
         </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">最新上架</h2>
          <span className="text-sm text-slate-500">{filteredProducts.length} 件商品</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500">沒有找到相關商品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
