export type Category = 'camisa' | 'bermuda' | 'bone' | 'oculos' | 'relogios' | 'calça' | 'sandalias' | 'tenis' | 'jaquetas';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  stock: number;
  imageUrl: string; // Keep for backward compat or primary
  images: string[];
  sizes: string[];
  colors: string[];
  sku?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  full_name?: string | null;
  role: 'customer' | 'admin';
  phone?: string | null;
  whatsapp?: string | null;
  avatar_url?: string | null;
  created_at: string;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}
