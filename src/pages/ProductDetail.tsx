import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductService } from '../services/product.service';
import { Product, ProductVariation } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from "motion/react";
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
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
import SizeGuideModal from '../components/SizeGuideModal';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);

  const [cep, setCep] = useState("");
  const [freightResult, setFreightResult] = useState<{ price: string; time: string } | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const { product, variations, error } = await ProductService.getProductById(id);
        if (product) {
          setProduct(product);
          setVariations(variations || []);
          setActiveImage(product.images?.[0] || product.imageUrl);
          
          // Select first variation as default
          if (variations && variations.length > 0) {
            setSelectedVariation(variations[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Update active image when variation changes
  useEffect(() => {
    if (selectedVariation) {
      if (selectedVariation.images && selectedVariation.images.length > 0) {
        setActiveImage(selectedVariation.images[0]);
      } else if (product) {
        // Fallback to product images if variation has no images
        setActiveImage(product.images?.[0] || product.imageUrl);
      }
    } else if (product) {
      setActiveImage(product.images?.[0] || product.imageUrl);
    }
  }, [selectedVariation, product]);

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


  const handleAddToCart = async () => {
    if (!product) return;
    
    // If no variations exist, allow adding to cart without selection
    if (variations.length === 0) {
      addToCart(product, 'Único', 'Padrão', 1);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2000);
      return;
    }
    
    // If variations exist, require selection
    if (!selectedVariation) {
      setValidationError("Por favor, selecione uma variação (tamanho + cor).");
      return;
    }
    
    if (selectedVariation.stock_quantity <= 0) {
      setValidationError("Esta variação está esgotada.");
      return;
    }
    
    setValidationError(null);
    addToCart(product, selectedVariation.size, selectedVariation.color, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    // If no variations exist, allow buying without selection
    if (variations.length === 0) {
      addToCart(product, 'Único', 'Padrão', 1);
      navigate('/checkout');
      return;
    }
    
    // If variations exist, require selection
    if (!selectedVariation) {
      setValidationError("Por favor, selecione uma variação (tamanho + cor).");
      return;
    }
    
    setValidationError(null);
    addToCart(product, selectedVariation.size, selectedVariation.color, 1);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-gray-900">
        <p className="uppercase tracking-[0.3em] text-gray-400 text-xs mb-4">Produto não localizado</p>
        <Button onClick={() => navigate('/store')} variant="outline" className="rounded-none border-gray-300 text-gray-900 hover:bg-gray-900 hover:text-white">
          Voltar ao Catálogo
        </Button>
      </div>
    );
  }

  const images = (() => {
    if (selectedVariation && selectedVariation.images && selectedVariation.images.length > 0) {
      return selectedVariation.images;
    }
    return product.images?.length ? product.images : [product.imageUrl];
  })();
  const originalPrice = (product as any).compare_at_price;
  const pixPrice = product.price * 0.95;
  const installmentPrice = (originalPrice || product.price) / 3;

  return (
    <div className="pt-32 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen text-gray-900 font-sans">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/store')} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-12 uppercase text-[10px] tracking-[0.3em] font-mono group"
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
                  className={`w-16 h-20 bg-gray-200 border transition-all shrink-0 overflow-hidden ${
                    activeImage === img ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-300 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 bg-gray-200 border border-gray-300 aspect-[4/5] relative overflow-hidden group">
            <img 
              src={activeImage || images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {product.stock > 0 && product.stock <= 3 && (
              <span className="absolute top-4 left-4 bg-orange-500 text-black text-[9px] font-extrabold px-3 py-1 uppercase tracking-widest font-mono">
                Últimas {product.stock} unidades
              </span>
            )}
            <span className="absolute top-4 right-4 bg-green-500/20 text-green-600 border border-green-500/40 text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest font-mono">
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
          <div className="bg-gray-50 border border-gray-200 p-6 space-y-3 relative overflow-hidden">
            {originalPrice && originalPrice > product.price && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-400 line-through font-mono">De: R$ {originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="bg-orange-500/10 text-orange-500 text-[9px] font-bold px-2 py-0.5 border border-orange-500/20 uppercase font-mono">
                  Economize R$ {(originalPrice - product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                R$ {pixPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-green-600 uppercase font-mono tracking-wider">
                no PIX (5% OFF)
              </span>
            </div>

            <p className="text-xs text-gray-600 font-mono">
              ou <strong className="text-gray-900">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> em até 3x de <strong className="text-gray-900">R$ {installmentPrice.toFixed(2).replace('.', ',')}</strong> no cartão
            </p>
          </div>

          {/* Variation Selector */}
          {variations.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-800">
                  Variação: <span className="text-orange-600">{selectedVariation ? `${selectedVariation.size} - ${selectedVariation.color}` : 'Selecione'}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {variations.map((variation) => {
                  const isOutOfStock = variation.stock_quantity <= 0;
                  return (
                    <button
                      key={variation.id}
                      onClick={() => {
                        if (!isOutOfStock) {
                          setSelectedVariation(variation);
                          setValidationError(null);
                        }
                      }}
                      disabled={isOutOfStock}
                      className={`px-4 py-2 border text-xs font-mono font-bold transition-all uppercase ${
                        selectedVariation?.id === variation.id
                          ? "bg-gray-900 text-white border-gray-900 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                          : isOutOfStock
                          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900"
                      }`}
                    >
                      {variation.size} - {variation.color}
                    </button>
                  );
                })}
              </div>
              
              {selectedVariation && selectedVariation.stock_quantity > 0 && selectedVariation.stock_quantity <= 5 && (
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mt-2">
                  Apenas {selectedVariation.stock_quantity} unidades disponíveis!
                </p>
              )}
              
              {selectedVariation && selectedVariation.stock_quantity === 0 && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-2">
                  Esta variação está esgotada
                </p>
              )}
            </div>
          )}

          {validationError && (
            <p className="text-xs text-red-500 font-mono bg-red-50 p-3 border border-red-200">
              {validationError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAddToCart}
              className="w-full h-14 bg-gray-900 text-white hover:bg-orange-500 rounded-none text-xs uppercase tracking-[0.25em] font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl"
            >
              <ShoppingCart className="w-4 h-4" />
              {addedAnimation ? "Item Adicionado ao Carrinho!" : "Adicionar ao Carrinho"}
            </Button>

            <Button
              onClick={handleBuyNow}
              variant="outline"
              className="w-full h-12 border-orange-500/50 text-orange-600 hover:bg-orange-50 rounded-none text-xs uppercase tracking-[0.2em] font-extrabold flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Comprar Agora no PIX
            </Button>
          </div>

          {/* Freight Estimator */}
          <div className="pt-6 border-t border-gray-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-700 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              Calcular Frete e Prazo
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs px-3 h-10 text-gray-900 font-mono rounded-none focus:border-orange-500 outline-none flex-1"
              />
              <Button
                onClick={handleCalculateCep}
                variant="outline"
                className="h-10 px-5 rounded-none text-[10px] uppercase font-bold tracking-widest border-gray-300 hover:bg-gray-900 hover:text-white text-gray-900"
              >
                {loadingCep ? "Calculando..." : "Calcular"}
              </Button>
            </div>

            {freightResult && (
              <div className="p-3 bg-gray-50 border border-gray-200 text-xs font-mono space-y-1">
                <p className="text-green-600 font-bold">Frete: {freightResult.price}</p>
                <p className="text-gray-600">Prazo estimado: {freightResult.time}</p>
              </div>
            )}
          </div>


        </div>

      </div>

      {/* Description Section */}
      <div className="mt-20 pt-12 border-t border-gray-200 max-w-4xl">
        <h3 className="text-xl font-serif italic text-gray-900 uppercase mb-6">Descrição & Detalhes da Peça</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line font-sans">
          {product.description || "Peça confeccionada em tecido de altíssima gramatura com corte moderno e caimento impecável. Curadoria exclusiva Real Store com selo de autenticidade garantido."}
        </p>
      </div>

    </div>
  );
}
