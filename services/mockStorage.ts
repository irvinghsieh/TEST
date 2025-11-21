

import { Product, User, ProductCondition, ProductStatus, Comment } from "../types";

const USERS_KEY = 'uni_users';
const PRODUCTS_KEY = 'uni_products';
const COMMENTS_KEY = 'uni_comments';
const CURRENT_USER_KEY = 'uni_current_user';

// Initialize Mock Data
const initData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const mockUsers: User[] = [
      {
        id: 'u1',
        email: 'demo@uni.com',
        nickname: 'UniDemoUser',
        avatarUrl: 'https://picsum.photos/id/64/200/200',
        socialLinks: { instagram: 'uni_official' },
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }

  if (!localStorage.getItem(PRODUCTS_KEY)) {
    const mockProducts: Product[] = [
      {
        id: 'p1',
        sellerId: 'u1',
        sellerNickname: 'UniDemoUser',
        sellerAvatar: 'https://picsum.photos/id/64/200/200',
        title: 'Fujifilm X100V 數位相機',
        description: '很少使用，外觀無刮痕，功能一切正常。附原廠皮套。',
        price: 42000,
        category: '3C',
        images: ['https://picsum.photos/id/250/800/600', 'https://picsum.photos/id/96/800/600'],
        condition: ProductCondition.LIKE_NEW,
        priceNote: 'AI 分析：保存狀況極佳，參考目前二手市場行情定價。',
        tags: ['相機', 'Fuji', '文青'],
        status: ProductStatus.ACTIVE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'p2',
        sellerId: 'u1',
        sellerNickname: 'UniDemoUser',
        sellerAvatar: 'https://picsum.photos/id/64/200/200',
        title: 'Levi\'s 牛仔外套',
        description: '穿過幾次，有些微使用痕跡，風格獨特。',
        price: 1500,
        category: 'Clothing',
        images: ['https://picsum.photos/id/338/800/600'],
        condition: ProductCondition.GOOD,
        priceNote: 'AI 分析：布料狀況良好，鈕扣完整。',
        tags: ['牛仔', '外套', '復古'],
        status: ProductStatus.ACTIVE,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
  }

  if (!localStorage.getItem(COMMENTS_KEY)) {
    const mockComments: Comment[] = [
      {
        id: 'c1',
        productId: 'p1',
        userId: 'u2_mock',
        userNickname: 'PhotographyLover',
        userAvatar: 'https://ui-avatars.com/api/?name=PhotographyLover&background=random',
        content: '請問快門數大約是多少呢？',
        createdAt: new Date(Date.now() - 10000000).toISOString()
      },
      {
        id: 'c2',
        productId: 'p1',
        userId: 'u1',
        userNickname: 'UniDemoUser',
        userAvatar: 'https://picsum.photos/id/64/200/200',
        content: '您好，快門數大約 2000 左右喔！',
        createdAt: new Date(Date.now() - 9000000).toISOString()
      }
    ];
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(mockComments));
  }
};

initData();

// --- User Services ---

export const loginUser = async (email: string): Promise<User> => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: User) => u.email === email);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  throw new Error("User not found");
};

export const registerUser = async (email: string, nickname: string): Promise<User> => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  if (users.find((u: User) => u.email === email)) {
    throw new Error("Email already exists");
  }
  const newUser: User = {
    id: 'u' + Date.now(),
    email,
    nickname,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Not logged in");
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex((u: User) => u.id === currentUser.id);
  
  if (index !== -1) {
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
  throw new Error("User update failed");
};

// --- Product Services ---

export const getProducts = async (filter?: { sellerId?: string, category?: string }): Promise<Product[]> => {
  let products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  
  // Sort by newest first
  products = products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (filter?.sellerId) {
    products = products.filter(p => p.sellerId === filter.sellerId);
  }
  if (filter?.category) {
    products = products.filter(p => p.category === filter.category);
  }
  return products.filter(p => p.status === ProductStatus.ACTIVE);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  return products.find(p => p.id === id);
};

export const createProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerNickname' | 'sellerAvatar' | 'status' | 'createdAt'>): Promise<Product> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Must be logged in to sell");

  const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  const newProduct: Product = {
    ...productData,
    id: 'p' + Date.now(),
    sellerId: currentUser.id,
    sellerNickname: currentUser.nickname,
    sellerAvatar: currentUser.avatarUrl,
    status: ProductStatus.ACTIVE,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  const index = products.findIndex((p: Product) => p.id === id);
  if (index !== -1) {
    // Keep original creation data, only update fields
    const updatedProduct = { ...products[index], ...updates };
    products[index] = updatedProduct;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return updatedProduct;
  }
  throw new Error("Product not found");
};

export const deleteProduct = async (productId: string): Promise<void> => {
  let products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  const initialLength = products.length;
  
  // Ensure strict string comparison
  products = products.filter(p => String(p.id) !== String(productId));
  
  if (products.length === initialLength) {
     throw new Error("Product not found or already deleted");
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

// --- Comment Services ---

export const getComments = async (productId: string): Promise<Comment[]> => {
  const comments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  // Sort chronological
  return comments
    .filter(c => c.productId === productId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const addComment = async (productId: string, content: string): Promise<Comment> => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Must be logged in to comment");

  const comments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const newComment: Comment = {
    id: 'c' + Date.now(),
    productId,
    userId: currentUser.id,
    userNickname: currentUser.nickname,
    userAvatar: currentUser.avatarUrl,
    content,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  return newComment;
};

// Mock Image Upload (In reality, you'd upload to S3/Cloudinary)
export const mockUploadImage = (base64: string): Promise<string> => {
    // In this mock, we just return the base64 data, but in real app we'd return a URL
    // Storing huge base64 strings in localStorage will hit quota quickly, so be careful.
    return Promise.resolve(base64);
}