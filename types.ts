export enum ProductCondition {
  NEW = 'NEW',           // 全新 (90-95% 原價)
  LIKE_NEW = 'LIKE_NEW', // 幾近全新 (80-85% 原價)
  GOOD = 'GOOD',         // 況況良好 (60-70% 原價)
  FAIR = 'FAIR',         // 功能正常 (40-50% 原價)
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  DELETED = 'DELETED'
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  line?: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  socialLinks?: SocialLinks;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerNickname: string;
  sellerAvatar?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[]; // Base64 or URLs
  condition: ProductCondition;
  priceNote?: string; // AI Generated reasoning
  tags: string[];
  status: ProductStatus;
  createdAt: string;
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userNickname: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  condition: ProductCondition;
  suggestedPrice: number;
  priceNote: string;
}