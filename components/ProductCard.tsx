import React from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductCondition } from '../types';
import { Tag } from 'lucide-react';

interface Props {
  product: Product;
}

const conditionColors: Record<ProductCondition, string> = {
  [ProductCondition.NEW]: 'bg-green-100 text-green-700',
  [ProductCondition.LIKE_NEW]: 'bg-blue-100 text-blue-700',
  [ProductCondition.GOOD]: 'bg-yellow-100 text-yellow-700',
  [ProductCondition.FAIR]: 'bg-orange-100 text-orange-700',
};

const conditionLabels: Record<ProductCondition, string> = {
  [ProductCondition.NEW]: '全新',
  [ProductCondition.LIKE_NEW]: '近全新',
  [ProductCondition.GOOD]: '良好',
  [ProductCondition.FAIR]: '功能正常',
};

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
        <img 
          src={product.images[0]} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${conditionColors[product.condition]}`}>
            {conditionLabels[product.condition]}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{product.title}</h3>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
           {product.tags.slice(0, 2).map(tag => (
             <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center">
               <Tag className="w-3 h-3 mr-0.5" /> {tag}
             </span>
           ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
             <img src={product.sellerAvatar || `https://ui-avatars.com/api/?name=${product.sellerNickname}`} className="w-6 h-6 rounded-full" alt="seller"/>
             <span className="text-xs text-slate-500 truncate max-w-[80px]">{product.sellerNickname}</span>
          </div>
          <span className="text-lg font-bold text-primary">NT$ {product.price.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
