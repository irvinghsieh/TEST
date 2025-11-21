
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, mockUploadImage, getProductById, updateProduct, deleteProduct } from '../services/mockStorage';
import { analyzeProductImages } from '../services/geminiService';
import { ProductCondition } from '../types';
import { Upload, Loader2, CheckCircle, Sparkles, X, Trash2 } from 'lucide-react';

const CONDITION_RATIOS = {
  [ProductCondition.NEW]: 0.92,      // ~90-95%
  [ProductCondition.LIKE_NEW]: 0.82, // ~80-85%
  [ProductCondition.GOOD]: 0.65,     // ~60-70%
  [ProductCondition.FAIR]: 0.45,     // ~40-50%
};

interface MediaItem {
  id: string;
  preview: string;
  file?: File; // Only for new uploads
}

const Sell: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [condition, setCondition] = useState<ProductCondition>(ProductCondition.GOOD);
  const [tags, setTags] = useState<string[]>([]);
  const [priceNote, setPriceNote] = useState('');

  // Base price for auto-calculation (estimated original price)
  const [basePrice, setBasePrice] = useState<number | null>(null);

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-white";

  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          const p = await getProductById(id);
          if (p) {
            setTitle(p.title);
            setDescription(p.description);
            setCategory(p.category);
            setPrice(p.price);
            setCondition(p.condition);
            setTags(p.tags);
            setPriceNote(p.priceNote || '');
            
            // Load images
            setMediaItems(p.images.map((url, idx) => ({
              id: `existing-${idx}`,
              preview: url
            })));
            
            // Estimate base price based on current price and condition
            const ratio = CONDITION_RATIOS[p.condition] || 1;
            setBasePrice(p.price / ratio);
          }
        } catch (e) {
          console.error("Failed to load product", e);
          navigate('/');
        }
      };
      loadProduct();
    }
  }, [id, isEditMode, navigate]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800; 
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
          } else {
             resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - mediaItems.length);
      if (newFiles.length > 0) {
        // Explicitly type 'file' as File to fix type inference error
        const newItems: MediaItem[] = await Promise.all(newFiles.map(async (file: File) => {
           const preview = await resizeImage(file);
           return {
             id: `new-${Date.now()}-${Math.random()}`,
             preview,
             file
           };
        }));
        setMediaItems(prev => [...prev, ...newItems]);
      }
    }
  };

  const removeImage = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAIAnalyze = async () => {
    const filesToAnalyze = mediaItems.map(m => m.file).filter((f): f is File => !!f);
    if (filesToAnalyze.length === 0) {
       alert("請先上傳新圖片以進行 AI 分析");
       return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeProductImages(filesToAnalyze);
      
      setTitle(result.title);
      setDescription(result.description);
      setCategory(result.category);
      setTags(result.tags);
      setPriceNote(result.priceNote);
      
      setPrice(result.suggestedPrice);
      setCondition(result.condition);
      
      const ratio = CONDITION_RATIOS[result.condition] || 1;
      setBasePrice(result.suggestedPrice / ratio);

    } catch (error) {
      alert("AI 分析失敗，請稍後再試或手動輸入。");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePriceChange = (val: number | '') => {
    setPrice(val);
    if (typeof val === 'number' && val > 0) {
      const ratio = CONDITION_RATIOS[condition] || 1;
      setBasePrice(val / ratio);
    } else {
      setBasePrice(null);
    }
  };

  const handleConditionChange = (newCondition: ProductCondition) => {
    setCondition(newCondition);
    if (basePrice) {
      const ratio = CONDITION_RATIOS[newCondition] || 1;
      const newPrice = Math.round(basePrice * ratio);
      setPrice(newPrice);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    try {
      // Upload new images (mock) and keep existing URLs
      const finalImageUrls = await Promise.all(mediaItems.map(async (item) => {
        if (item.file) {
           // It's a new file, upload it (using the resize preview as base64)
           return await mockUploadImage(item.preview);
        } else {
           // It's an existing URL
           return item.preview;
        }
      }));

      const productData = {
        title,
        description,
        price: Number(price),
        category,
        images: finalImageUrls,
        condition,
        priceNote,
        tags
      };

      if (isEditMode && id) {
        await updateProduct(id, productData);
        navigate(`/product/${id}`);
      } else {
        await createProduct(productData);
        navigate('/');
      }
      
    } catch (error: any) {
      console.error(error);
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        alert("儲存失敗：圖片總容量過大，請減少圖片數量。");
      } else {
        alert("操作失敗: " + (error.message || "未知錯誤"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">{isEditMode ? '編輯商品' : '上架商品'}</h1>
        
        <div className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">商品圖片 (最多3張)</label>
            <div className="grid grid-cols-3 gap-4">
               {mediaItems.map((item) => (
                 <div key={item.id} className="aspect-square relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                    <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
               ))}
               
               {mediaItems.length < 3 && (
                 <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 bg-slate-50/50"
                 >
                    <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                       <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">上傳圖片</span>
                 </button>
               )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              multiple 
              className="hidden" 
            />
          </div>

          {/* AI Button - Disable if no new files to analyze */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100/60 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-indigo-900 flex items-center gap-2 text-base"><Sparkles className="w-4 h-4 text-indigo-500" /> AI 智能分析</h3>
              <p className="text-xs text-indigo-600/80 mt-1 font-medium">
                 {isEditMode ? '上傳新圖片後可重新分析' : '上傳圖片後，讓 AI 自動幫您填寫資訊與估價。'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={isAnalyzing || !mediaItems.some(m => !!m.file)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                 (isAnalyzing || !mediaItems.some(m => !!m.file)) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' :
                 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 hover:shadow-indigo-300 active:scale-95'
              }`}
            >
              {isAnalyzing ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 分析中...</span> : '一鍵生成'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">商品標題</label>
               <input 
                 type="text" 
                 value={title}
                 onChange={e => setTitle(e.target.value)}
                 className={inputClasses}
                 placeholder="例如：Apple iPhone 14 Pro Max 256G"
                 required
               />
             </div>

             <div className="grid grid-cols-2 gap-5">
               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">分類</label>
                 <input 
                   type="text" 
                   value={category}
                   onChange={e => setCategory(e.target.value)}
                   className={inputClasses}
                   placeholder="例如：3C"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">價格 (TWD)</label>
                 <input 
                   type="number" 
                   value={price}
                   onChange={e => handlePriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                   className={`${inputClasses} font-mono font-medium`}
                   placeholder="0"
                   required
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">商品狀況</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {Object.values(ProductCondition).map(c => (
                   <button
                     key={c}
                     type="button"
                     onClick={() => handleConditionChange(c)}
                     className={`py-2.5 px-3 rounded-xl text-sm border transition-all duration-200 font-medium ${
                       condition === c 
                       ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-500 shadow-sm' 
                       : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 bg-white'
                     }`}
                   >
                     {c === 'NEW' ? '全新' : c === 'LIKE_NEW' ? '近全新' : c === 'GOOD' ? '良好' : '功能正常'}
                   </button>
                 ))}
               </div>
               <p className="text-xs text-slate-400 mt-2 ml-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  切換狀況將自動調整建議售價
               </p>
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">商品描述</label>
               <textarea 
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 className={`${inputClasses} h-36 resize-none`}
                 placeholder="描述商品的詳細狀況、購買來源等..."
                 required
               />
             </div>

             {tags.length > 0 && (
               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">標籤</label>
                 <div className="flex flex-wrap gap-2">
                   {tags.map((tag, i) => (
                     <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">#{tag}</span>
                   ))}
                 </div>
               </div>
             )}
             
             {/* Hidden/Readonly Price Note */}
             {priceNote && (
                <div className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <span className="font-semibold text-slate-700 not-italic">AI 筆記：</span> {priceNote}
                </div>
             )}

             <div className="pt-4 flex gap-3">
               {isEditMode && (
                 <button
                   type="button"
                   onClick={handleDelete}
                   className="flex-1 bg-red-50 text-red-500 hover:bg-red-100 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                   <Trash2 className="w-5 h-5" />
                   刪除商品
                 </button>
               )}
               <button 
                 type="submit"
                 className={`bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isEditMode ? 'flex-[2]' : 'w-full'}`}
               >
                 <CheckCircle className="w-5 h-5" />
                 {isEditMode ? '儲存變更' : '確認上架'}
               </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sell;