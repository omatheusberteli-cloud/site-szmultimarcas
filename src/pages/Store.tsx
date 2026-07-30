import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useProducts } from '../context/ProductContext';
import { supabase } from '../lib/supabase';
import { Category, Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from "motion/react";
import { Filter, ShoppingBag, Search, ShoppingCart, Zap, Check } from "lucide-react";
import { Button } from '../../components/ui/button';

const categories: { label: string; value: Category | 'all' }[] = [
  { label: 'Todos os Items', value: 'all' },
  { label: 'Acessórios', value: 'oculos' },
  { label: 'Bonés', value: 'bone' },
  { label: 'Calças', value: 'calça' },
  { label: 'Camisa', value: 'camisa' },
  { label: 'Camisas de Time', value: 'camisa-time' },
  { label: 'Camisas Street', value: 'camisa-street' },
  { label: 'Gola Polo', value: 'gola-polo' },
  { label: 'Jaquetas', value: 'jaquetas' },
  { label: 'Relógios', value: 'relogios' },
  { label: 'Sandálias', value: 'sandalias' },
  { label: 'Shorts', value: 'shorts' },
  { label: 'Tênis', value: 'tenis' },
];

export default function Store() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat') as Category | 'all' || 'all';
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const { products: allProducts, loading } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Filter products from context based on category slug
    let filtered = allProducts;
    if (catParam !== 'all') {
      filtered = allProducts.filter(p => p.category === catParam);
    }
    setProducts(filtered);
  }, [catParam, allProducts]);

  const filteredProducts = searchTerm.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : products;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For now, just add with default values since variations are managed separately
    // The user should go to product detail to select specific variation
    addToCart(product, 'M', 'Preto', 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="pt-32 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen text-gray-900 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-gray-200 gap-6">
        <div>
          <p className="text-orange-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">Real Store — Catálogo Oficial</p>
          <h1 className="text-3xl sm:text-5xl font-serif italic text-gray-900 leading-tight">
            Coleção <span className="text-orange-500 font-sans not-italic font-extrabold">2026</span>
          </h1>
        </div>

        {/* Filter search bar */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Filtrar por modelo ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs px-4 h-11 text-gray-900 font-mono rounded-none focus:border-orange-500 outline-none pr-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
        </div>
      </header>

      <div className="flex gap-12">
        {/* Main Grid */}
        <main className="flex-1 pb-20">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 border border-dashed border-gray-200 bg-gray-50 space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-gray-500 uppercase tracking-[0.3em] text-xs font-mono">Nenhum produto encontrado nesta categoria</p>
                <Button onClick={() => setSearchParams({ cat: 'all' })} className="rounded-none border border-gray-300 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-900 text-[10px] uppercase tracking-widest font-bold">
                  Ver Todo o Catálogo
                </Button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredProducts.map((product) => {
                  const displayImage = product.images?.[0] || (product as any).imageUrl;
                  const pixPrice = product.price * 0.95;
                  const originalPrice = (product as any).compare_at_price;
                  const isAdded = addedIds[product.id];

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ y: -4 }}
                      className="group bg-gray-50 border border-gray-200 p-4 flex flex-col justify-between relative hover:border-orange-500/40 transition-all"
                    >
                      <Link to={`/product/${product.id}`} className="block flex-1">
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
                          <img 
                            src={displayImage} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-2 left-2 bg-green-500 text-black text-[8px] font-extrabold px-2 py-0.5 uppercase tracking-wider font-mono">
                            PIX -5%
                          </span>
                        </div>

                        <p className="text-[9px] uppercase font-mono text-gray-500 mb-1">{product.category}</p>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors">
                          {product.name}
                        </h4>

                        <div className="mt-2 font-mono">
                          {originalPrice && originalPrice > product.price && (
                            <p className="text-[9px] text-gray-400 line-through">De: R$ {originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          )}
                          <p className="text-sm font-extrabold text-gray-900">
                            R$ {pixPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] text-green-600 font-bold">no PIX</span>
                          </p>
                          <p className="text-[9px] text-gray-500">ou R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} no cartão</p>
                        </div>
                      </Link>

                      <Button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`w-full mt-4 h-9 rounded-none text-[9px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-2 ${
                          isAdded
                            ? "bg-green-500 text-black"
                            : "bg-gray-200 hover:bg-gray-900 text-gray-900 hover:text-white"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Adicionado!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" /> + Adicionar
                          </>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
