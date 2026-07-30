import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product, ProductVariation, UserProfile } from '../types';
import { useProducts } from '../context/ProductContext';
import { ProductService } from '../services/product.service';
import { supabase } from '../lib/supabase';
import { Button } from "../../components/ui/button";
import { ArrowLeft, X, Terminal } from "lucide-react";

interface PDASalesProps {
  profile: UserProfile | null;
}

export default function PDASales({ profile }: PDASalesProps) {
  const navigate = useNavigate();
  const { products: contextProducts, refreshProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariations, setProductVariations] = useState<Record<string, ProductVariation[]>>({});
  
  // PDA (Point of Sale) states
  const [pdaCart, setPdaCart] = useState<Array<{product: Product, variation?: ProductVariation, quantity: number}>>([]);
  const [pdaSearchTerm, setPdaSearchTerm] = useState('');
  const [pdaSelectedVariation, setPdaSelectedVariation] = useState<ProductVariation | null>(null);

  useEffect(() => {
    if (contextProducts) {
      setProducts(contextProducts);
      contextProducts.forEach(product => {
        loadProductVariations(product.id);
      });
    }
  }, [contextProducts]);

  const loadProductVariations = async (productId: string) => {
    try {
      const { data: variations } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);
      
      setProductVariations(prev => ({
        ...prev,
        [productId]: variations || []
      }));
    } catch (err) {
      console.error('Error loading variations:', err);
    }
  };

  const addToPDACart = (product: Product, variation?: ProductVariation) => {
    const existingIndex = pdaCart.findIndex(item => 
      item.product.id === product.id && 
      (!variation || item.variation?.id === variation.id)
    );

    if (existingIndex >= 0) {
      setPdaCart(prev => prev.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setPdaCart(prev => [...prev, { product, variation, quantity: 1 }]);
    }
  };

  const removeFromPDACart = (index: number) => {
    setPdaCart(prev => prev.filter((_, i) => i !== index));
  };

  const updatePDACartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromPDACart(index);
      return;
    }
    setPdaCart(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const clearPDACart = () => {
    setPdaCart([]);
    setPdaSelectedVariation(null);
  };

  const completePDASale = async () => {
    if (pdaCart.length === 0) {
      alert('Carrinho vazio');
      return;
    }

    try {
      for (const item of pdaCart) {
        if (item.variation) {
          await ProductService.reduceStockByVariation(item.variation.id, item.quantity);
          
          const productId = item.product.id;
          const variations = productVariations[productId] || [];
          const totalStock = variations.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
          await ProductService.updateProduct(productId, { stock_quantity: totalStock } as any);
        } else {
          await ProductService.reduceStock(item.product.id, item.quantity);
        }
      }

      await refreshProducts();
      clearPDACart();
      alert('Venda realizada com sucesso! Estoque atualizado.');
    } catch (err) {
      console.error('Erro ao finalizar venda:', err);
      alert('Erro ao finalizar venda. Tente novamente.');
    }
  };

  const getPDATotal = () => {
    return pdaCart.reduce((total, item) => {
      const price = item.variation ? item.product.price : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h2 className="text-2xl font-display uppercase mb-4 text-orange-500">Acesso Restrito</h2>
        <p className="text-gray-400 max-w-xs text-sm">Apenas administradores podem acessar o PDA de vendas.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 px-8 min-h-screen pb-24 bg-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 border-b border-gray-200 pb-10">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="rounded-none border-gray-300 text-gray-600 hover:border-orange-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Admin
          </Button>
          <div>
            <p className="text-gray-500 text-[10px] tracking-widest uppercase mb-1">Point of Sale Terminal</p>
            <h1 className="text-4xl font-serif italic text-gray-900">PDA de <span className="text-green-500 underline underline-offset-8 decoration-gray-200">Vendas</span></h1>
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-300px)]">
        {/* Left: Product Selection */}
        <div className="flex-1 flex flex-col border-r border-gray-200 pr-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={pdaSearchTerm}
              onChange={(e) => setPdaSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm px-4 h-10 text-gray-900 font-mono rounded-none focus:border-green-500 outline-none"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {products
              .filter(p => 
                p.name.toLowerCase().includes(pdaSearchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(pdaSearchTerm.toLowerCase())
              )
              .map(product => {
                const variations = productVariations[product.id] || [];
                return (
                  <div key={product.id} className="border border-gray-200 p-4 hover:border-green-500 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 overflow-hidden border border-gray-300 shrink-0">
                        <img 
                          src={(product.images && product.images.length > 0) ? product.images[0] : product.imageUrl} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold uppercase text-gray-900 truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        
                        {variations.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500">Variações:</p>
                            {variations.map(variation => (
                              <button
                                key={variation.id}
                                onClick={() => {
                                  setPdaSelectedVariation(variation);
                                  addToPDACart(product, variation);
                                }}
                                disabled={variation.stock_quantity <= 0}
                                className={`w-full text-left px-3 py-2 text-xs border transition-colors ${
                                  variation.stock_quantity <= 0
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{variation.size} - {variation.color}</span>
                                  <span className="font-mono">Estoque: {variation.stock_quantity}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => addToPDACart(product)}
                            disabled={(product.stock || 0) <= 0}
                            className={`mt-3 w-full py-2 text-xs uppercase font-bold transition-colors ${
                              (product.stock || 0) <= 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {(product.stock || 0) <= 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 flex flex-col">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Carrinho de Vendas</h3>
            <p className="text-xs text-gray-500">{pdaCart.length} itens</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3">
            {pdaCart.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                Carrinho vazio
              </div>
            ) : (
              pdaCart.map((item, index) => (
                <div key={index} className="border border-gray-200 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.product.name}</p>
                      {item.variation && (
                        <p className="text-xs text-gray-500">{item.variation.size} - {item.variation.color}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromPDACart(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updatePDACartQuantity(index, item.quantity - 1)}
                        className="w-6 h-6 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updatePDACartQuantity(index, item.quantity + 1)}
                        className="w-6 h-6 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-gray-900">
                      R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {getPDATotal().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={clearPDACart}
                variant="outline"
                className="flex-1 rounded-none border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Limpar
              </Button>
              <Button
                onClick={completePDASale}
                disabled={pdaCart.length === 0}
                className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-none font-bold"
              >
                Finalizar Venda
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
