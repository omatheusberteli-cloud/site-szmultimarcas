import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

export interface OrderItemData {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  metadata?: any;
}

export interface CreateOrderData {
  user_id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: any;
  payment_method?: string;
  customer_notes?: string;
  items: OrderItemData[];
}

export class OrderService {
  // Obter pedidos do usuário
  static async getUserOrders(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ orders: Order[]; error: Error | null }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return { orders: orders || [], error: null };
    } catch (error) {
      return { orders: [], error: error as Error };
    }
  }

  // Obter pedido por ID
  static async getOrderById(orderId: string): Promise<{ order: Order | null; error: Error | null }> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return { order, error: null };
    } catch (error) {
      return { order: null, error: error as Error };
    }
  }

  // Obter pedido com itens
  static async getOrderWithItems(orderId: string): Promise<{ 
    order: Order | null; 
    items: OrderItem[];
    error: Error | null 
  }> {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      return { order, items: items || [], error: null };
    } catch (error) {
      return { order: null, items: [], error: error as Error };
    }
  }

  // Criar novo pedido
  static async createOrder(data: CreateOrderData): Promise<{ 
    order: Order | null; 
    error: Error | null 
  }> {
    try {
      // Iniciar transação manualmente
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: data.user_id,
          order_number: data.order_number,
          subtotal: data.subtotal,
          shipping_cost: data.shipping_cost,
          discount_amount: data.discount_amount,
          total_amount: data.total_amount,
          shipping_address: data.shipping_address,
          payment_method: data.payment_method,
          customer_notes: data.customer_notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Inserir itens do pedido
      const orderItems = data.items.map(item => ({
        order_id: order.id,
        ...item,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { order, error: null };
    } catch (error) {
      return { order: null, error: error as Error };
    }
  }

  // Atualizar status do pedido
  static async updateOrderStatus(
    orderId: string,
    status: string,
    paymentStatus?: string
  ): Promise<{ order: Order | null; error: Error | null }> {
    try {
      const updateData: OrderUpdate = { status };
      
      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
      }

      // Atualizar timestamps baseado no status
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return { order, error: null };
    } catch (error) {
      return { order: null, error: error as Error };
    }
  }

  // Adicionar tracking ao pedido
  static async addTracking(
    orderId: string,
    trackingCode: string,
    trackingUrl: string
  ): Promise<{ order: Order | null; error: Error | null }> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({
          tracking_code: trackingCode,
          tracking_url: trackingUrl,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return { order, error: null };
    } catch (error) {
      return { order: null, error: error as Error };
    }
  }

  // Cancelar pedido
  static async cancelOrder(orderId: string): Promise<{ order: Order | null; error: Error | null }> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          payment_status: 'refunded',
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return { order, error: null };
    } catch (error) {
      return { order: null, error: error as Error };
    }
  }

  // Gerar número de pedido único
  static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Buscar último pedido do mês
    const { data: lastOrder } = await supabase
      .from('orders')
      .select('order_number')
      .like('order_number', `ORD-${year}-${month}%`)
      .order('order_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.order_number.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    const sequenceStr = String(sequence).padStart(4, '0');
    return `ORD-${year}-${month}-${sequenceStr}`;
  }

  // Obter estatísticas de pedidos do usuário
  static async getUserOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
    error: Error | null;
  }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, total_amount')
        .eq('user_id', userId);

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0;
      const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0;

      return {
        totalOrders,
        totalSpent,
        pendingOrders,
        deliveredOrders,
        error: null,
      };
    } catch (error) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        error: error as Error,
      };
    }
  }
}
