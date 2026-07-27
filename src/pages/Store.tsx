import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ProductService } from '../services/product.service';
import { supabase } from '../lib/supabase';
import { Category, Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from "motion/react";
import { Filter, ShoppingBag, Search, ShoppingCart, Zap, Check } from "lucide-react";
import { Button } from '../../components/ui/button';

const categories: { label: string; value: Category | 'all' }[] = [
  { label: 'Todos os Items', value: 'all' },
  { label: 'Camisas', value: 'camisa' },
  { label: 'Bermudas', value: 'bermuda' },
  { label: 'Calças', value: 'calça' },
  { label: 'Jaquetas', value: 'jaquetas' },
  { label: 'Tênis', value: 'tenis' },
  { label: 'Acessórios', value: 'oculos' },
];

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat') as Category | 'all' || 'all';
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const filters: any = {};
        if (catParam !== 'all') {
          // Get category_id from category slug
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', catParam)
            .single();
          
          if (categoryData) {
            filters.category_id = categoryData.id;
          }
        }
        const { products, error } = await ProductService.getProducts(filters, 1, 50);
        if (products) {
          setProducts(products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [catParam]);

  const filteredProducts = searchTerm.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : products;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Preto', 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="pt-32 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen text-white font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-white/10 gap-6">
        <div>
          <p className="text-orange-400 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">SZ Multimarcas — Catálogo Oficial</p>
          <h1 className="text-3xl sm:text-5xl font-serif italic text-white leading-tight">
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
            className="w-full bg-white/5 border border-white/10 text-xs px-4 h-11 text-white font-mono rounded-none focus:border-orange-500 outline-none pr-10"
          />
          <Search className="w-4 h-4 text-white/40 absolute right-3 top-3.5" />
        </div>
      </header>

      {/* Category Pills for Mobile / Desktop */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSearchParams({ cat: cat.value })}
            className={`px-4 h-9 text-[10px] font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all border shrink-0 ${
              catParam === cat.value
                ? "bg-orange-500 text-black border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-12">
        {/* Main Grid */}
        <main className="flex-1 pb-20">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 border border-dashed border-white/10 bg-white/[0.01] space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-white/20" />
                <p className="text-white/40 uppercase tracking-[0.3em] text-xs font-mono">Nenhum produto encontrado nesta categoria</p>
                <Button onClick={() => setSearchParams({ cat: 'all' })} className="rounded-none border border-white/20 bg-white/10 hover:bg-white hover:text-black text-white text-[10px] uppercase tracking-widest font-bold">
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
                  const displayImage = product.images?.[0] || product.imageUrl;
                  const pixPrice = product.price * 0.95;
                  const isAdded = addedIds[product.id];

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ y: -4 }}
                      className="group bg-white/[0.02] border border-white/10 p-4 flex flex-col justify-between relative hover:border-orange-500/40 transition-all"
                    >
                      <Link to={`/product/${product.id}`} className="block flex-1">
                        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 mb-4">
                          <img 
                            src={displayImage} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-2 left-2 bg-green-500 text-black text-[8px] font-extrabold px-2 py-0.5 uppercase tracking-wider font-mono">
                            PIX -5%
                          </span>
                          <span className="absolute top-2 right-2 bg-black/80 text-white/70 text-[8px] font-mono px-2 py-0.5 border border-white/10 uppercase">
                            {product.stock > 0 ? `Estoque: ${product.stock}` : 'Esgotado'}
                          </span>
                        </div>

                        <p className="text-[9px] uppercase font-mono text-white/40 mb-1">{product.category}</p>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                          {product.name}
                        </h4>

                        <div className="mt-2 font-mono">
                          <p className="text-sm font-extrabold text-white">
                            R$ {pixPrice.toLocaleString('pt-BR')} <span className="text-[9px] text-green-400 font-bold">no PIX</span>
                          </p>
                          <p className="text-[9px] text-white/40">ou R$ {product.price.toLocaleString('pt-BR')} no cartão</p>
                        </div>
                      </Link>

                      <Button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`w-full mt-4 h-9 rounded-none text-[9px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-2 ${
                          isAdded
                            ? "bg-green-500 text-black"
                            : "bg-white/10 hover:bg-white text-white hover:text-black"
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
