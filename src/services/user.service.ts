import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type Address = Database['public']['Tables']['addresses']['Row'];
type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
type AddressUpdate = Database['public']['Tables']['addresses']['Update'];

export interface AddressFormData {
  label?: string;
  recipient_name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default?: boolean;
}

export class UserService {
  // Obter perfil do usuário
  static async getProfile(userId: string): Promise<{ profile: Profile | null; error: Error | null }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { profile, error: null };
    } catch (error) {
      return { profile: null, error: error as Error };
    }
  }

  // Atualizar perfil do usuário
  static async updateProfile(
    userId: string,
    data: Partial<ProfileInsert>
  ): Promise<{ profile: Profile | null; error: Error | null }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { profile, error: null };
    } catch (error) {
      return { profile: null, error: error as Error };
    }
  }

  // Obter endereços do usuário
  static async getAddresses(userId: string): Promise<{ addresses: Address[]; error: Error | null }> {
    try {
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { addresses: addresses || [], error: null };
    } catch (error) {
      return { addresses: [], error: error as Error };
    }
  }

  // Obter endereço por ID
  static async getAddress(addressId: string): Promise<{ address: Address | null; error: Error | null }> {
    try {
      const { data: address, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single();

      if (error) throw error;

      return { address, error: null };
    } catch (error) {
      return { address: null, error: error as Error };
    }
  }

  // Criar novo endereço
  static async createAddress(
    userId: string,
    data: AddressFormData
  ): Promise<{ address: Address | null; error: Error | null }> {
    try {
      // Se for marcado como padrão, remove o padrão dos outros endereços
      if (data.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data: address, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      return { address, error: null };
    } catch (error) {
      return { address: null, error: error as Error };
    }
  }

  // Atualizar endereço
  static async updateAddress(
    addressId: string,
    userId: string,
    data: Partial<AddressFormData>
  ): Promise<{ address: Address | null; error: Error | null }> {
    try {
      // Se for marcado como padrão, remove o padrão dos outros endereços
      if (data.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
          .neq('id', addressId);
      }

      const { data: address, error } = await supabase
        .from('addresses')
        .update(data as AddressUpdate)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { address, error: null };
    } catch (error) {
      return { address: null, error: error as Error };
    }
  }

  // Deletar endereço
  static async deleteAddress(addressId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Definir endereço como padrão
  static async setDefaultAddress(
    addressId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    try {
      // Remove o padrão de todos os endereços
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Define o novo endereço como padrão
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Obter endereço padrão
  static async getDefaultAddress(userId: string): Promise<{ address: Address | null; error: Error | null }> {
    try {
      const { data: address, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

      return { address: address || null, error: null };
    } catch (error) {
      return { address: null, error: error as Error };
    }
  }
}
