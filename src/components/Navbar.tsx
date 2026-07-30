import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, User as UserIcon, Search, Menu, X, ShieldCheck, Sparkles, Phone } from "lucide-react";
import { UserProfile, Product } from '../types';
import { AuthService } from '../services/auth.service';
import { useProducts } from '../context/ProductContext';
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
  const { products: contextProducts } = useProducts();
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
    if (contextProducts) {
      setAllProducts(contextProducts);
    }
  }, [contextProducts]);

  const filteredSearchResults = searchTerm.trim() 
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-8 h-20 flex items-center justify-between border-b ${
        isScrolled ? "bg-white/95 backdrop-blur-2xl border-gray-200 shadow-2xl" : "bg-white/60 backdrop-blur-md border-gray-100"
      }`}
    >
      <div className="flex items-center gap-8">
        <Link to="/" className="shrink-0">
          <img src={ASSETS.logo} alt="Real Store Logo" className="h-12 w-auto" />
        </Link>

        {/* Categories Menu */}
        <div className="hidden xl:flex gap-6 text-[10px] tracking-[0.2em] uppercase font-medium text-gray-600">
          <Link to="/store" className="hover:text-gray-900 transition-colors">Tudo</Link>
          <Link to="/store?cat=bone" className="hover:text-gray-900 transition-colors">Bonés</Link>
          <Link to="/store?cat=calça" className="hover:text-gray-900 transition-colors">Calças</Link>
          <Link to="/store?cat=camisa" className="hover:text-gray-900 transition-colors">Camisa</Link>
          <Link to="/store?cat=camisa-time" className="hover:text-gray-900 transition-colors">Camisas de Time</Link>
          <Link to="/store?cat=camisa-street" className="hover:text-gray-900 transition-colors">Camisas Street</Link>
          <Link to="/store?cat=gola-polo" className="hover:text-gray-900 transition-colors">Gola Polo</Link>
          <Link to="/store?cat=jaquetas" className="hover:text-gray-900 transition-colors">Jaquetas</Link>
          <Link to="/store?cat=oculos" className="hover:text-gray-900 transition-colors">Acessórios</Link>
          <Link to="/store?cat=relogios" className="hover:text-gray-900 transition-colors">Relógios</Link>
          <Link to="/store?cat=sandalias" className="hover:text-gray-900 transition-colors">Sandálias</Link>
          <Link to="/store?cat=shorts" className="hover:text-gray-900 transition-colors">Shorts</Link>
          <Link to="/store?cat=tenis" className="hover:text-gray-900 transition-colors">Tênis</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-orange-500 font-bold hover:text-orange-600 transition-colors flex items-center gap-1">
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
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
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
                className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-gray-200 p-4 shadow-2xl rounded-none text-gray-900 z-50"
              >
                <div className="relative mb-3">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Digite o nome do produto ou marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs px-3 h-10 text-gray-900 rounded-none focus:border-orange-500 outline-none pr-8"
                  />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {searchTerm.trim() && (
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-2">
                    {filteredSearchResults.length === 0 ? (
                      <p className="text-[10px] uppercase text-gray-400 text-center py-4 font-mono">Nenhum item encontrado</p>
                    ) : (
                      filteredSearchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchTerm("");
                            navigate(`/product/${product.id}`);
                          }}
                          className="pt-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 transition-colors group"
                        >
                          <img src={product.images?.[0] || product.imageUrl} className="w-10 h-12 object-cover border border-gray-200 shrink-0" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase text-gray-900 group-hover:text-orange-500 transition-colors truncate">{product.name}</p>
                            <p className="text-[9px] text-gray-500 font-mono">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
          className="p-2.5 bg-gray-100 border border-gray-200 hover:bg-gray-200 rounded-full transition-all relative group"
        >
          <ShoppingCart className="w-5 h-5 text-gray-900 group-hover:text-orange-500 transition-colors" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-black text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-[0_0_10px_rgba(249,115,22,0.6)]">
              {totalItems}
            </span>
          )}
        </button>

        <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />

        {/* Auth / Account Profile Dropdown */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="text-right hidden sm:block">
                  <div className="text-[8px] text-orange-500 uppercase tracking-widest font-mono font-bold">
                    {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </div>
                  <div className="text-xs font-medium text-gray-900">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? <img src={user.photoURL} alt="" /> : <UserIcon className="w-4 h-4 text-gray-600" />}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 text-gray-900 min-w-[200px] p-2 mt-2">
              <div className="px-4 py-3 mb-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">{profile?.full_name || user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-500 truncate font-mono">{user?.email}</p>
              </div>
              {profile?.role === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer text-[10px] uppercase tracking-widest text-orange-500 hover:bg-orange-50 py-2">
                  Painel de Estoque Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={async () => {
                await AuthService.signOut();
                navigate('/auth');
              }} className="cursor-pointer text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 py-2">
                Sair da Conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="outline" 
            className="rounded-none h-9 text-[9px] uppercase tracking-[0.2em] border-gray-300 hover:bg-gray-900 hover:text-white transition-all px-5 font-bold" 
            onClick={() => navigate('/auth')}
          >
            Entrar / Cadastrar
          </Button>
        )}

      </div>
    </motion.nav>
  );
}
