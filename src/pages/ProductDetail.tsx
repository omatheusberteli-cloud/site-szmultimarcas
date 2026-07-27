import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductService } from '../services/product.service';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from "motion/react";
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  Truck, 
  Check, 
  Star, 
  Zap, 
  MessageSquare,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from '../../components/ui/button';
import { getStyleAdvice } from '../lib/gemini';
import SizeGuideModal from '../components/SizeGuideModal';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [gettingAdvice, setGettingAdvice] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const [cep, setCep] = useState("");
  const [freightResult, setFreightResult] = useState<{ price: string; time: string } | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const { product, error } = await ProductService.getProductById(id);
        if (product) {
          setProduct(product);
          setActiveImage(product.images?.[0] || product.imageUrl);
          if (product.sizes && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
          if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0]);
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleCalculateCep = async () => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFreightResult({
          price: product && product.price >= 299 ? "GRÁTIS" : "R$ 19,90",
          time: "2 a 4 dias úteis (SEDEX)"
        });
      } else {
        setFreightResult({ price: "R$ 19,90", time: "3 a 5 dias úteis" });
      }
    } catch {
      setFreightResult({ price: "R$ 19,90", time: "3 a 5 dias úteis" });
    } finally {
      setLoadingCep(false);
    }
  };

  const handleGetAdvice = async () => {
    if (!product) return;
    setGettingAdvice(true);
    try {
      const text = await getStyleAdvice(`Como combinar este item: ${product.name}, um(a) ${product.category}. Descrição: ${product.description}. Cores disponíveis: ${product.colors?.join(', ')}`);
      setAdvice(text);
    } catch (error) {
      console.error(error);
    } finally {
      setGettingAdvice(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      setValidationError("Por favor, selecione um tamanho.");
      return;
    }
    setValidationError(null);
    addToCart(product, selectedSize, selectedColor, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      setValidationError("Por favor, selecione um tamanho.");
      return;
    }
    setValidationError(null);
    addToCart(product, selectedSize, selectedColor, 1);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
        <p className="uppercase tracking-[0.3em] text-white/30 text-xs mb-4">Produto não localizado</p>
        <Button onClick={() => navigate('/store')} variant="outline" className="rounded-none border-white/20">
          Voltar ao Catálogo
        </Button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.imageUrl];
  const pixPrice = product.price * 0.95;
  const installmentPrice = product.price / 12;

  return (
    <div className="pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen text-white font-sans">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/store')} 
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 uppercase text-[10px] tracking-[0.3em] font-mono group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        Voltar à loja
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left: Gallery Column */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-[550px]">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-20 bg-neutral-900 border transition-all shrink-0 overflow-hidden ${
                    activeImage === img ? "border-orange-500 ring-2 ring-orange-500/20" : "border-white/10 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 bg-neutral-900 border border-white/10 aspect-[4/5] relative overflow-hidden group">
            <img 
              src={activeImage || images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.stock > 0 && product.stock <= 3 && (
              <span className="absolute top-4 left-4 bg-orange-500 text-black text-[9px] font-extrabold px-3 py-1 uppercase tracking-widest font-mono">
                Últimas {product.stock} unidades
              </span>
            )}
            <span className="absolute top-4 right-4 bg-green-500/20 text-green-400 border border-green-500/40 text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest font-mono">
              ⚡ -5% NO PIX
            </span>
          </div>

        </div>

        {/* Right: Product Details Column */}
        <div className="lg:col-span-5 space-y-8">
          
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[9px] uppercase tracking-widest text-white/40">
              <span className="text-orange-400 font-bold">{product.category}</span>
              <span>•</span>
              <span>SKU: {product.sku || product.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-white uppercase tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Reviews Star Bar */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-white/60 font-mono text-[10px]">5.0 (48 avaliações de clientes)</span>
            </div>
          </div>

          {/* Price Callout Box */}
          <div className="bg-white/[0.02] border border-white/10 p-6 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-white/40 line-through font-mono">De: R$ {(product.price * 1.25).toFixed(2).replace('.', ',')}</span>
              <span className="bg-orange-500/10 text-orange-400 text-[9px] font-bold px-2 py-0.5 border border-orange-500/20 uppercase font-mono">
                Economize R$ {(product.price * 0.25 + product.price * 0.05).toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                R$ {pixPrice.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs font-bold text-green-400 uppercase font-mono tracking-wider">
                no PIX (5% OFF)
              </span>
            </div>

            <p className="text-xs text-white/60 font-mono">
              ou <strong className="text-white">R$ {product.price.toLocaleString('pt-BR')}</strong> em até 12x de <strong className="text-white">R$ {installmentPrice.toFixed(2).replace('.', ',')}</strong> no cartão
            </p>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                  Tamanho: <span className="text-orange-400">{selectedSize}</span>
                </span>
                <SizeGuideModal />
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSize(sz);
                      setValidationError(null);
                    }}
                    className={`min-w-[48px] h-11 px-3 border text-xs font-mono font-bold transition-all uppercase ${
                      selectedSize === sz
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                Cor: <span className="text-orange-400">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 h-9 border text-xs font-mono transition-all uppercase ${
                      selectedColor === color
                        ? "bg-orange-500/20 border-orange-500 text-orange-400 font-bold"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {validationError && (
            <p className="text-xs text-red-400 font-mono bg-red-500/10 p-3 border border-red-500/20">
              {validationError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAddToCart}
              className="w-full h-14 bg-white text-black hover:bg-orange-500 hover:text-white rounded-none text-xs uppercase tracking-[0.25em] font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl"
            >
              <ShoppingCart className="w-4 h-4" />
              {addedAnimation ? "Item Adicionado ao Carrinho!" : "Adicionar ao Carrinho"}
            </Button>

            <Button
              onClick={handleBuyNow}
              variant="outline"
              className="w-full h-12 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 rounded-none text-xs uppercase tracking-[0.2em] font-extrabold flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Comprar Agora no PIX
            </Button>
          </div>

          {/* Freight Estimator */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-400" />
              Calcular Frete e Prazo
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="bg-white/5 border border-white/10 text-xs px-3 h-10 text-white font-mono rounded-none focus:border-orange-500 outline-none flex-1"
              />
              <Button
                onClick={handleCalculateCep}
                variant="outline"
                className="h-10 px-5 rounded-none text-[10px] uppercase font-bold tracking-widest border-white/20 hover:bg-white hover:text-black"
              >
                {loadingCep ? "Calculando..." : "Calcular"}
              </Button>
            </div>

            {freightResult && (
              <div className="p-3 bg-white/5 border border-white/10 text-xs font-mono space-y-1">
                <p className="text-green-400 font-bold">Frete: {freightResult.price}</p>
                <p className="text-white/60">Prazo estimado: {freightResult.time}</p>
              </div>
            )}
          </div>

          {/* AI Style Advice Trigger */}
          <div className="pt-6 border-t border-white/10">
            <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4" />
                Consultor de Estilo IA
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Quer saber como combinar este {product.name} com calças, tênis e acessórios?
              </p>
              <Button
                onClick={handleGetAdvice}
                disabled={gettingAdvice}
                variant="outline"
                className="rounded-none border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-[10px] uppercase font-bold tracking-widest h-9"
              >
                {gettingAdvice ? "Consultando IA..." : "Gerar Dicas de Modas & Look"}
              </Button>

              {advice && (
                <div className="mt-3 p-4 bg-black/80 border border-white/10 text-xs text-white/80 leading-relaxed whitespace-pre-line font-sans">
                  {advice}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Description Section */}
      <div className="mt-20 pt-12 border-t border-white/10 max-w-4xl">
        <h3 className="text-xl font-serif italic text-white uppercase mb-6">Descrição & Detalhes da Peça</h3>
        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line font-sans">
          {product.description || "Peça confeccionada em tecido de altíssima gramatura com corte moderno e caimento impecável. Curadoria exclusiva SZ Multimarcas com selo de autenticidade garantido."}
        </p>
      </div>

    </div>
  );
}
