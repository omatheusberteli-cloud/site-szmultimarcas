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
import { ProductProvider } from './context/ProductContext';

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
import PDASales from './pages/PDASales';

import { ShieldCheck, Truck, Lock } from 'lucide-react';

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
      <ProductProvider>
        <Router>
          <ErrorBoundary>
            <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-500/30 flex flex-col justify-between">
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
                    <Route path="/pda-sales" element={<PDASales profile={profile} />} />
                    <Route path="/auth" element={<Auth />} />
                  </Routes>
                </main>
              </div>

              {/* Footer */}
              <footer className="border-t border-gray-200 bg-white pt-16 pb-12 px-6 text-gray-900 text-xs mt-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-200">
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-light tracking-[0.3em] uppercase text-gray-900">
                      Real Store
                    </h3>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                      Peças selecionadas, entrega rápida e garantia de autenticidade para todo o Brasil
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">Categorias</h4>
                    <ul className="space-y-2 text-[11px] text-gray-600 uppercase tracking-wider font-mono">
                      <li><a href="/store?cat=camisa" className="hover:text-orange-500 transition-colors">Camisa</a></li>
                      <li><a href="/store?cat=camisa-street" className="hover:text-orange-500 transition-colors">Camisas Street</a></li>
                      <li><a href="/store?cat=camisa-time" className="hover:text-orange-500 transition-colors">Camisas de Time</a></li>
                      <li><a href="/store?cat=gola-polo" className="hover:text-orange-500 transition-colors">Gola Polo</a></li>
                      <li><a href="/store?cat=shorts" className="hover:text-orange-500 transition-colors">Shorts</a></li>
                      <li><a href="/store?cat=bone" className="hover:text-orange-500 transition-colors">Bonés</a></li>
                      <li><a href="/store?cat=calça" className="hover:text-orange-500 transition-colors">Calças</a></li>
                      <li><a href="/store?cat=jaquetas" className="hover:text-orange-500 transition-colors">Jaquetas</a></li>
                      <li><a href="/store?cat=oculos" className="hover:text-orange-500 transition-colors">Acessórios</a></li>
                      <li><a href="/store?cat=relogios" className="hover:text-orange-500 transition-colors">Relógios</a></li>
                      <li><a href="/store?cat=tenis" className="hover:text-orange-500 transition-colors">Tênis</a></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">Atendimento & Dúvidas</h4>
                    <ul className="space-y-2 text-[11px] text-gray-600 uppercase tracking-wider font-mono">
                      <li><span>WhatsApp: (27) 99849-9540</span></li>
                      <li><span>Horário: Seg. a Sáb. - 09h às 20h</span></li>
                      <li><span>E-mail: contato@szmultimarcas.com.br</span></li>
                      <li><span>Envios via SEDEX & PAC Correios</span></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">Formas de Pagamento</h4>
                    <div className="grid grid-cols-5 gap-4">
                      {/* PIX */}
                      <div className="flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity">
                        <img src="/pix.svg" alt="PIX" className="w-16 h-10 object-contain" />
                        <span className="text-[8px] font-mono font-bold text-green-600">PIX</span>
                      </div>
                      
                      {/* Visa */}
                      <div className="flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity">
                        <img src="/visa.svg" alt="Visa" className="w-16 h-10 object-contain" />
                        <span className="text-[8px] font-mono font-bold text-gray-600">VISA</span>
                      </div>
                      
                      {/* Mastercard */}
                      <div className="flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity">
                        <img src="/mastercard.svg" alt="Mastercard" className="w-16 h-10 object-contain" />
                        <span className="text-[8px] font-mono font-bold text-gray-600">Master</span>
                      </div>
                      
                      {/* Elo */}
                      <div className="flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity">
                        <img src="/elo.svg" alt="Elo" className="w-16 h-10 object-contain" />
                        <span className="text-[8px] font-mono font-bold text-gray-600">ELO</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 pt-2 font-mono">
                      Parcele em até 3x no cartão de crédito ou ganhe 5% de desconto no Pix.
                    </p>
                  </div>

                </div>

                <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 uppercase font-mono tracking-widest">
                  <p>© 2026 REAL STORE LTDA — TODOS OS DIREITOS RESERVADOS.</p>
                  <div className="flex gap-6">
                    <a href="#" className="hover:text-gray-900 transition-colors">Trocas e Devoluções</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">Termos de Uso</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">Política de Privacidade</a>
                  </div>
                </div>
              </footer>
            </div>
          </ErrorBoundary>
      </Router>
      </ProductProvider>
    </CartProvider>
  );
}
