import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type CartItem = Database['public']['Tables']['cart_items']['Row'];
type CartItemInsert = Database['public']['Tables']['cart_items']['Insert'];
type CartItemUpdate = Database['public']['Tables']['cart_items']['Update'];

export interface CartItemData {
  product_id: string;
  quantity: number;
  metadata?: any;
}

export class CartService {
  // Obter carrinho do usuário
  static async getCart(userId: string): Promise<{ items: CartItem[]; error: Error | null }> {
    try {
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            slug,
            price,
            compare_at_price,
            images,
            stock_quantity,
            is_active
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { items: items || [], error: null };
    } catch (error) {
      return { items: [], error: error as Error };
    }
  }

  // Adicionar item ao carrinho
  static async addToCart(
    userId: string,
    data: CartItemData
  ): Promise<{ item: CartItem | null; error: Error | null }> {
    try {
      // Verificar se o item já existe no carrinho
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', data.product_id)
        .single();

      if (existingItem) {
        // Atualizar quantidade se já existir
        const { data: updatedItem, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + data.quantity,
            metadata: data.metadata || existingItem.metadata,
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;

        return { item: updatedItem, error: null };
      }

      // Inserir novo item
      const { data: item, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      return { item, error: null };
    } catch (error) {
      return { item: null, error: error as Error };
    }
  }

  // Atualizar quantidade do item
  static async updateCartItem(
    cartItemId: string,
    userId: string,
    quantity: number
  ): Promise<{ item: CartItem | null; error: Error | null }> {
    try {
      if (quantity <= 0) {
        // Se quantidade for 0 ou negativa, remove o item
        const { error } = await this.removeFromCart(cartItemId, userId);
        return { item: null, error };
      }

      const { data: item, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { item, error: null };
    } catch (error) {
      return { item: null, error: error as Error };
    }
  }

  // Remover item do carrinho
  static async removeFromCart(
    cartItemId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Limpar carrinho do usuário
  static async clearCart(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Obter total do carrinho
  static async getCartTotal(userId: string): Promise<{ 
    total: number;
    itemCount: number;
    error: Error | null;
  }> {
    try {
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          products (
            price
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const total = items?.reduce((sum, item: any) => {
        return sum + (item.quantity * item.products.price);
      }, 0) || 0;

      const itemCount = items?.reduce((sum, item: any) => sum + item.quantity, 0) || 0;

      return { total, itemCount, error: null };
    } catch (error) {
      return { total: 0, itemCount: 0, error: error as Error };
    }
  }

  // Mover carrinho para pedido (usado no checkout)
  static async getCartForCheckout(userId: string): Promise<{ 
    items: any[];
    total: number;
    error: Error | null;
  }> {
    try {
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            slug,
            price,
            sku,
            images,
            stock_quantity
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const total = items?.reduce((sum, item: any) => {
        return sum + (item.quantity * item.products.price);
      }, 0) || 0;

      return { items: items || [], total, error: null };
    } catch (error) {
      return { items: [], total: 0, error: error as Error };
    }
  }

  // Verificar disponibilidade de estoque
  static async checkStockAvailability(userId: string): Promise<{ 
    available: boolean;
    outOfStockItems: any[];
    error: Error | null;
  }> {
    try {
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          product_id,
          products (
            id,
            name,
            stock_quantity,
            is_active
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const outOfStockItems: any[] = [];

      items?.forEach((item: any) => {
        if (!item.products.is_active || item.products.stock_quantity < item.quantity) {
          outOfStockItems.push({
            product_id: item.product_id,
            product_name: item.products.name,
            requested_quantity: item.quantity,
            available_quantity: item.products.stock_quantity,
            is_active: item.products.is_active,
          });
        }
      });

      return { 
        available: outOfStockItems.length === 0, 
        outOfStockItems,
        error: null 
      };
    } catch (error) {
      return { available: false, outOfStockItems: [], error: error as Error };
    }
  }
}
