import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type Category = Database['public']['Tables']['categories']['Row'];

export interface ProductFilters {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_active?: boolean;
}

export class ProductService {
  // Obter todos os produtos
  static async getProducts(
    filters: ProductFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ products: Product[]; total: number; error: Error | null }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Aplicar filtros
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data: products, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return { products: products || [], total: count || 0, error: null };
    } catch (error) {
      return { products: [], total: 0, error: error as Error };
    }
  }

  // Obter produto por ID
  static async getProductById(productId: string): Promise<{ product: Product | null; error: Error | null }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      return { product, error: null };
    } catch (error) {
      return { product: null, error: error as Error };
    }
  }

  // Obter produto por slug
  static async getProductBySlug(slug: string): Promise<{ product: Product | null; error: Error | null }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return { product, error: null };
    } catch (error) {
      return { product: null, error: error as Error };
    }
  }

  // Obter produtos em destaque
  static async getFeaturedProducts(limit = 8): Promise<{ products: Product[]; error: Error | null }> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { products: products || [], error: null };
    } catch (error) {
      return { products: [], error: error as Error };
    }
  }

  // Obter produtos relacionados
  static async getRelatedProducts(
    productId: string,
    categoryId: string | null,
    limit = 4
  ): Promise<{ products: Product[]; error: Error | null }> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('id', productId)
        .limit(limit);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: products, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { products: products || [], error: null };
    } catch (error) {
      return { products: [], error: error as Error };
    }
  }

  // Buscar produtos
  static async searchProducts(
    searchTerm: string,
    page = 1,
    limit = 20
  ): Promise<{ products: Product[]; total: number; error: Error | null }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: products, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return { products: products || [], total: count || 0, error: null };
    } catch (error) {
      return { products: [], total: 0, error: error as Error };
    }
  }

  // Obter categorias
  static async getCategories(): Promise<{ categories: Category[]; error: Error | null }> {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return { categories: categories || [], error: null };
    } catch (error) {
      return { categories: [], error: error as Error };
    }
  }

  // Obter categoria por slug
  static async getCategoryBySlug(slug: string): Promise<{ category: Category | null; error: Error | null }> {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      return { category, error: null };
    } catch (error) {
      return { category: null, error: error as Error };
    }
  }

  // Criar produto (admin)
  static async createProduct(data: ProductInsert): Promise<{ product: Product | null; error: Error | null }> {
    try {
      console.log('ProductService.createProduct - Dados recebidos:', data);
      const { data: product, error } = await supabase
        .from('products')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('ProductService.createProduct - Erro Supabase:', error);
        throw error;
      }

      console.log('ProductService.createProduct - Produto criado:', product);
      return { product, error: null };
    } catch (error) {
      console.error('ProductService.createProduct - Erro catch:', error);
      return { product: null, error: error as Error };
    }
  }

  // Atualizar produto (admin)
  static async updateProduct(
    productId: string,
    data: ProductUpdate
  ): Promise<{ product: Product | null; error: Error | null }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return { product, error: null };
    } catch (error) {
      return { product: null, error: error as Error };
    }
  }

  // Deletar produto (admin)
  static async deleteProduct(productId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Atualizar estoque
  static async updateStock(
    productId: string,
    quantity: number
  ): Promise<{ product: Product | null; error: Error | null }> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .update({ stock_quantity: quantity })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return { product, error: null };
    } catch (error) {
      return { product: null, error: error as Error };
    }
  }

  // Reduzir estoque (usado em pedidos)
  static async reduceStock(
    productId: string,
    quantity: number
  ): Promise<{ product: Product | null; error: Error | null }> {
    try {
      // Primeiro obtém o produto atual
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const newQuantity = Math.max(0, currentProduct.stock_quantity - quantity);

      const { data: product, error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return { product, error: null };
    } catch (error) {
      return { product: null, error: error as Error };
    }
  }
}
