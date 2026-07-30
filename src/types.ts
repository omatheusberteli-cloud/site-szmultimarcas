export type Category = 'camisa' | 'gola-polo' | 'camisa-time' | 'camisa-street' | 'shorts' | 'bone' | 'oculos' | 'relogios' | 'calça' | 'sandalias' | 'tenis' | 'jaquetas';

export interface ProductVariation {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
  images: string[];
  sku: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  stock: number;
  imageUrl: string;
  images: string[];
  sku?: string;
  createdAt: string;
  variations?: ProductVariation[];
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
