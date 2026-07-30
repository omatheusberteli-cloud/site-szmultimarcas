import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, Percent, ArrowRight, ShieldCheck, Check, MessageSquare } from "lucide-react";
import { useCart } from '../context/CartContext';
import { useNavigate } from "react-router-dom";
import { Button } from '../../components/ui/button';

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    totalItems,
    coupon,
    couponDiscountPercent,
    applyCoupon,
    removeCoupon
  } = useCart();

  const navigate = useNavigate();
  const [cep, setCep] = useState("");
  const [freightCost, setFreightCost] = useState<number | null>(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 299;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const couponDiscountValue = (subtotal * couponDiscountPercent) / 100;
  const subtotalAfterCoupon = subtotal - couponDiscountValue;
  const pixDiscountValue = subtotalAfterCoupon * 0.05;
  const totalWithPix = subtotalAfterCoupon - pixDiscountValue + (freightCost || 0);

  const handleCalculateCep = async () => {
    if (cep.replace(/\D/g, "").length !== 8) return;
    setFreightLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFreightCost(isFreeShipping ? 0 : 19.9);
      } else {
        setFreightCost(19.9);
      }
    } catch {
      setFreightCost(19.9);
    } finally {
      setFreightLoading(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const ok = applyCoupon(couponInput);
    if (ok) {
      setCouponSuccess(true);
      setCouponError(false);
      setCouponInput("");
      setTimeout(() => setCouponSuccess(false), 3000);
    } else {
      setCouponError(true);
      setTimeout(() => setCouponError(false), 3000);
    }
  };

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "5527998499540"; // Official sales desk number
    let message = `*NOVO PEDIDO - REAL STORE*\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n   Tam: ${item.size} | Cor: ${item.color} | Qtd: ${item.quantity}\n   Preço: R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
    });
    if (coupon) {
      message += `*Cupom Aplicado:* ${coupon} (-${couponDiscountPercent}%)\n`;
    }
    message += `*Subtotal:* R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    message += `*Total no PIX (5% OFF):* R$ ${totalWithPix.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
    message += `Gostaria de finalizar esta compra com o consultor online!`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-y-0 right-0 max-w-full flex pl-10"
          >
            <div className="w-screen max-w-md bg-white border-l border-gray-200 text-gray-900 flex flex-col shadow-2xl">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">Carrinho de Compras</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{totalItems} {totalItems === 1 ? 'item selecionado' : 'itens selecionados'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-gray-200">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 font-medium mb-1">Seu carrinho está vazio</p>
                      <p className="text-[10px] text-gray-400 tracking-wider">Explore nosso catálogo e monte seu visual streetwear</p>
                    </div>
                    <Button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/store');
                      }}
                      className="rounded-none bg-gray-900 text-white hover:bg-orange-500 text-[10px] uppercase tracking-widest px-8 h-10 mt-4 font-bold"
                    >
                      Ver Lançamentos
                    </Button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="pt-4 first:pt-0 flex gap-4 group">
                      <div className="w-20 h-24 bg-gray-200 border border-gray-300 shrink-0 overflow-hidden relative">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-medium uppercase tracking-wider text-gray-900 line-clamp-1">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Remover item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-gray-500 uppercase tracking-widest">
                            <span className="bg-gray-100 px-2 py-0.5 border border-gray-300">Tam: {item.size}</span>
                            <span className="bg-gray-100 px-2 py-0.5 border border-gray-300">Cor: {item.color}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border border-gray-300 bg-gray-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-mono text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="text-right font-mono">
                            <p className="text-xs font-bold text-gray-900">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-[9px] text-green-600">Pix: R$ {((item.price * item.quantity) * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
                  
                  {/* Freight & Coupon Tools */}
                  <div className="space-y-2">
                    {/* Coupon Form */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Cupom de desconto (ex: SZ10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="w-full bg-gray-100 border border-gray-300 text-xs text-gray-900 px-3 h-9 uppercase font-mono focus:border-orange-500 outline-none"
                        />
                        {coupon && (
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="absolute right-2 top-2 text-[9px] uppercase tracking-widest text-red-400 font-mono"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <Button type="submit" variant="outline" className="h-9 px-4 rounded-none text-[9px] uppercase tracking-widest border-gray-300 hover:bg-gray-200 text-gray-900">
                        Aplicar
                      </Button>
                    </form>

                    {couponSuccess && <p className="text-[9px] text-green-400 font-mono">Cupom aplicado com sucesso!</p>}
                    {couponError && <p className="text-[9px] text-red-500 font-mono">Cupom inválido. Tente SZ10 ou LB10</p>}
                    
                    {coupon && (
                      <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 text-green-600 text-[10px] font-mono uppercase tracking-widest">
                        <span>Cupom {coupon} (-{couponDiscountPercent}%)</span>
                        <span>-R$ {couponDiscountValue.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Summary Box */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-200 font-mono text-xs">
                    <div className="flex justify-between text-gray-600 text-[10px] uppercase">
                      <span>Subtotal</span>
                      <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {freightCost !== null && (
                      <div className="flex justify-between text-gray-600 text-[10px] uppercase">
                        <span>Frete</span>
                        <span>{freightCost === 0 ? <strong className="text-green-600">GRÁTIS</strong> : `R$ ${freightCost.toFixed(2).replace('.', ',')}`}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-green-600 font-bold text-xs uppercase pt-1">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        Desconto PIX (5% OFF)
                      </span>
                      <span>-R$ {pixDiscountValue.toFixed(2).replace('.', ',')}</span>
                    </div>

                    <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Total no PIX</span>
                        <span className="text-xl font-bold text-gray-900">R$ {totalWithPix.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <span className="text-[9px] text-gray-500 text-right">
                        ou 12x de R$ {(subtotalAfterCoupon / 12).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Call to Actions */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={handleWhatsAppCheckout}
                      className="w-full h-12 bg-green-500 text-black hover:bg-green-600 rounded-none text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Comprar via WhatsApp
                    </Button>
                  </div>

                  <p className="text-[8px] text-center text-white/30 uppercase tracking-widest font-mono flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-orange-400" />
                    Pagamento 100% Criptografado & Garantido
                  </p>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
