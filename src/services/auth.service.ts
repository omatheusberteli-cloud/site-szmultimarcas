import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export interface AuthResponse {
  user: any;
  profile: Profile | null;
  error: Error | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  whatsapp?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  // Registrar novo usuário
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            whatsapp: data.whatsapp,
          },
        },
      });

      if (authError) throw authError;

      // O perfil é criado automaticamente pelo trigger no Supabase
      // Mas vamos buscar para garantir e definir role se necessário
      let profile = null;
      if (authData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        // Se o perfil não tiver role definido, definir baseado no email
        if (profileData && !profileData.role) {
          const isAdmin = data.email === 'omatheusberteli@gmail.com' || data.email === 'arrudamaty@gmail.com';
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ role: isAdmin ? 'admin' : 'customer' })
            .eq('id', authData.user.id)
            .select()
            .single();
          
          profile = updatedProfile;
        } else {
          profile = profileData;
        }
      }

      return { user: authData.user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error: error as Error };
    }
  }

  // Login de usuário
  static async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      let profile = null;
      if (authData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        // Se o perfil não tiver role definido, definir baseado no email
        if (profileData && !profileData.role) {
          const isAdmin = data.email === 'omatheusberteli@gmail.com' || data.email === 'arrudamaty@gmail.com';
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ role: isAdmin ? 'admin' : 'customer' })
            .eq('id', authData.user.id)
            .select()
            .single();
          
          profile = updatedProfile;
        } else {
          profile = profileData;
        }
      }

      return { user: authData.user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error: error as Error };
    }
  }


  // Logout
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Obter usuário atual
  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      let profile = null;
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        profile = profileData;
      }

      return { user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error: error as Error };
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

  // Resetar senha
  static async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Atualizar senha
  static async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Listener de mudanças na autenticação
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
