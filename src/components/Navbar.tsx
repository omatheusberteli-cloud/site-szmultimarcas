import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, User as UserIcon, Search, Menu, X, ShieldCheck, Sparkles, Phone } from "lucide-react";
import { UserProfile, Product } from '../types';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { Button } from '../../components/ui/button';
import { useCart } from '../context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useState, useEffect } from "react";
import { ASSETS } from '../lib/assets';

interface NavbarProps {
  user: any;
  profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const { products, error } = await ProductService.getProducts({}, 1, 100);
        if (products) {
          setAllProducts(products);
        }
      } catch (err) {
        console.error("Error fetching products for search:", err);
      }
    }
    fetchAllProducts();
  }, []);

  const filteredSearchResults = searchTerm.trim() 
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-8 h-20 flex items-center justify-between border-b ${
        isScrolled ? "bg-black/95 backdrop-blur-2xl border-white/10 shadow-2xl" : "bg-black/60 backdrop-blur-md border-white/5"
      }`}
    >
      <div className="flex items-center gap-8">
        <Link to="/" className="shrink-0">
          <img src={ASSETS.logo} alt="SZ Multimarcas Logo" className="h-12 w-auto" />
        </Link>

        {/* Categories Menu */}
        <div className="hidden xl:flex gap-6 text-[10px] tracking-[0.2em] uppercase font-medium text-white/60">
          <Link to="/store" className="hover:text-white transition-colors">Tudo</Link>
          <Link to="/store?cat=camisa" className="hover:text-white transition-colors">Camisas</Link>
          <Link to="/store?cat=jaquetas" className="hover:text-white transition-colors">Jaquetas</Link>
          <Link to="/store?cat=tenis" className="hover:text-white transition-colors">Tênis</Link>
          <Link to="/store?cat=oculos" className="hover:text-white transition-colors">Acessórios</Link>
          <Link to="/store?cat=bermuda" className="hover:text-white transition-colors">Bermudas</Link>
          <Link to="/store?cat=calça" className="hover:text-white transition-colors">Calças</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-orange-400 font-bold hover:text-orange-300 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Painel Admin
            </Link>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Search Trigger */}
        <div className="relative">
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Buscar Produtos"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Search Popup Modal */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0E0E0E] border border-white/10 p-4 shadow-2xl rounded-none text-white z-50"
              >
                <div className="relative mb-3">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Digite o nome do produto ou marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs px-3 h-10 text-white rounded-none focus:border-orange-500 outline-none pr-8"
                  />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-2 top-2.5 text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {searchTerm.trim() && (
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/5 pr-1 space-y-2">
                    {filteredSearchResults.length === 0 ? (
                      <p className="text-[10px] uppercase text-white/40 text-center py-4 font-mono">Nenhum item encontrado</p>
                    ) : (
                      filteredSearchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchTerm("");
                            navigate(`/product/${product.id}`);
                          }}
                          className="pt-2 flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 transition-colors group"
                        >
                          <img src={product.images?.[0] || product.imageUrl} className="w-10 h-12 object-cover border border-white/10 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase text-white group-hover:text-orange-400 transition-colors truncate">{product.name}</p>
                            <p className="text-[9px] text-white/40 font-mono">R$ {product.price.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart Trigger */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all relative group"
        >
          <ShoppingCart className="w-5 h-5 text-white group-hover:text-orange-400 transition-colors" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-black text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border border-black shadow-[0_0_10px_rgba(249,115,22,0.6)]">
              {totalItems}
            </span>
          )}
        </button>

        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

        {/* Auth / Account Profile Dropdown */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="text-right hidden sm:block">
                  <div className="text-[8px] text-orange-400 uppercase tracking-widest font-mono font-bold">
                    {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </div>
                  <div className="text-xs font-medium text-white">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 border border-white/20 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? <img src={user.photoURL} alt="" /> : <UserIcon className="w-4 h-4" />}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0A0A0A] border border-white/10 text-white min-w-[200px] p-2 mt-2">
              <div className="px-4 py-3 mb-2 border-b border-white/5">
                <p className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{profile?.full_name || user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-white/40 truncate font-mono">{user?.email}</p>
              </div>
              {profile?.role === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer text-[10px] uppercase tracking-widest text-orange-400 hover:bg-orange-500/10 py-2">
                  Painel de Estoque Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={async () => {
                await AuthService.signOut();
                navigate('/auth');
              }} className="cursor-pointer text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/10 py-2">
                Sair da Conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="outline" 
            className="rounded-none h-9 text-[9px] uppercase tracking-[0.2em] border-white/20 hover:bg-white hover:text-black transition-all px-5 font-bold" 
            onClick={() => navigate('/auth')}
          >
            Entrar / Cadastrar
          </Button>
        )}

      </div>
    </motion.nav>
  );
}
