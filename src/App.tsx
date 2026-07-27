/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserProfile } from './types';
import { CartProvider } from './context/CartContext';

// Components & Pages
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

import { ShieldCheck, Truck, Lock, CreditCard, QrCode } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App useEffect - loading user');
    async function loadUser() {
      try {
        console.log('Calling AuthService.getCurrentUser()');
        const { user: currentUser, profile: currentProfile } = await AuthService.getCurrentUser();
        console.log('User loaded:', currentUser);
        console.log('Profile loaded:', currentProfile);
        setUser(currentUser);
        setProfile(currentProfile);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();

    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (session?.user) {
        const { user: currentUser, profile: currentProfile } = await AuthService.getCurrentUser();
        setUser(currentUser);
        setProfile(currentProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <CartProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30 flex flex-col justify-between">
            <div>
              <Navbar user={user} profile={profile} />
              <CartDrawer />
              <WhatsAppButton />

              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                  <Route path="/admin" element={<Admin profile={profile} />} />
                  <Route path="/auth" element={<Auth />} />
                </Routes>
              </main>
            </div>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/90 pt-16 pb-12 px-6 text-white text-xs mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
              
              <div className="space-y-4">
                <h3 className="text-lg font-light tracking-[0.3em] uppercase text-white">
                  SZ<span className="font-extrabold text-orange-500"> Multimarcas</span>
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                  Sua loja de streetwear e curadoria multimarcas de alto padrão. Peças selecionadas, entrega rápida e garantia de autenticidade para todo o Brasil.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-green-400 font-mono font-bold">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Selo SSL 256-bit Verificado</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Categorias</h4>
                <ul className="space-y-2 text-[11px] text-white/50 uppercase tracking-wider font-mono">
                  <li><a href="/store?cat=camisa" className="hover:text-orange-400 transition-colors">Camisas</a></li>
                  <li><a href="/store?cat=jaquetas" className="hover:text-orange-400 transition-colors">Jaquetas</a></li>
                  <li><a href="/store?cat=tenis" className="hover:text-orange-400 transition-colors">Tênis</a></li>
                  <li><a href="/store?cat=oculos" className="hover:text-orange-400 transition-colors">Acessórios</a></li>
                  <li><a href="/store?cat=bermuda" className="hover:text-orange-400 transition-colors">Bermudas</a></li>
                  <li><a href="/store?cat=calça" className="hover:text-orange-400 transition-colors">Calças</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Atendimento & Dúvidas</h4>
                <ul className="space-y-2 text-[11px] text-white/50 uppercase tracking-wider font-mono">
                  <li><span>WhatsApp: (27) 99849-9540</span></li>
                  <li><span>Horário: Seg. a Sáb. - 09h às 20h</span></li>
                  <li><span>E-mail: contato@szmultimarcas.com.br</span></li>
                  <li><span>Envios via SEDEX & PAC Correios</span></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Formas de Pagamento</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 border border-white/10 p-2 text-center text-[9px] font-mono font-bold text-green-400 flex items-center justify-center gap-1">
                    <QrCode className="w-3.5 h-3.5" /> PIX -5%
                  </div>
                  <div className="bg-white/5 border border-white/10 p-2 text-center text-[9px] font-mono text-white/70 flex items-center justify-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Cartão
                  </div>
                  <div className="bg-white/5 border border-white/10 p-2 text-center text-[9px] font-mono text-white/70">
                    Boleto
                  </div>
                </div>
                <p className="text-[10px] text-white/40 pt-2 font-mono">
                  Parcele em até 12x no cartão de crédito ou ganhe 5% de desconto no Pix.
                </p>
              </div>

            </div>

            <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/40 uppercase font-mono tracking-widest">
              <p>© 2026 SZ MULTIMARCAS LTDA — TODOS OS DIREITOS RESERVADOS.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Trocas e Devoluções</a>
                <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              </div>
            </div>
          </footer>
        </div>
        </ErrorBoundary>
      </Router>
    </CartProvider>
  );
}
