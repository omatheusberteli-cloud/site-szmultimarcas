import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  ArrowLeft, 
  ShoppingBag,
  Building2,
  MessageCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, coupon, couponDiscountPercent, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [shippingOption, setShippingOption] = useState<"sedex" | "pac">("sedex");
  const [loadingCep, setLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/store');
    }
  }, [cart, navigate]);

  // Auto ViaCEP lookup
  const handleCepBlur = async () => {
    const cleanedCep = formData.cep.replace(/\D/g, "");
    if (cleanedCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        }
      } catch (e) {
        console.warn("CEP lookup error", e);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Price math
  const FREE_SHIPPING_THRESHOLD = 299;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : shippingOption === "sedex" ? 19.9 : 9.9;
  
  const couponDiscountValue = (subtotal * couponDiscountPercent) / 100;
  const subtotalAfterCoupon = subtotal - couponDiscountValue;
  
  const finalTotal = subtotalAfterCoupon + shippingCost;

  const handleFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.cpf || !formData.phone || !formData.street || !formData.number) {
      alert("Por favor, preencha todos os campos obrigatórios de endereço e contato.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate WhatsApp message
      const phoneNumber = "5527998499540"; // Your WhatsApp number
      
      let message = `🛒 *NOVO PEDIDO - SZ MULTIMARCAS*\n\n`;
      message += `👤 *DADOS DO CLIENTE*\n`;
      message += `Nome: ${formData.name}\n`;
      message += `Email: ${formData.email}\n`;
      message += `CPF: ${formData.cpf}\n`;
      message += `Telefone: ${formData.phone}\n\n`;
      
      message += `📍 *ENDEREÇO DE ENTREGA*\n`;
      message += `CEP: ${formData.cep}\n`;
      message += `Rua: ${formData.street}, ${formData.number}\n`;
      message += `Complemento: ${formData.complement || 'N/A'}\n`;
      message += `Bairro: ${formData.neighborhood}\n`;
      message += `Cidade: ${formData.city} - ${formData.state}\n\n`;
      
      message += `📦 *ITENS DO PEDIDO*\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Qtd: ${item.quantity} | Tam: ${item.size} | Cor: ${item.color}\n`;
        message += `   Preço: R$ ${item.price.toFixed(2).replace('.', ',')}\n\n`;
      });
      
      message += `💰 *RESUMO DO VALOR*\n`;
      message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
      if (couponDiscountValue > 0) {
        message += `Desconto Cupom: -R$ ${couponDiscountValue.toFixed(2).replace('.', ',')}\n`;
      }
      message += `Frete (${shippingOption.toUpperCase()}): ${shippingCost === 0 ? 'GRÁTIS' : 'R$ ' + shippingCost.toFixed(2).replace('.', ',')}\n`;
      message += `*TOTAL: R$ ${finalTotal.toFixed(2).replace('.', ',')}*\n\n`;
      
      message += `🚚 *MÉTODO DE ENVIO*: ${shippingOption === 'sedex' ? 'SEDEX Expresso' : 'PAC Padrão'}\n`;
      message += `💳 *PAGAMENTO*: Via WhatsApp (a combinar)\n\n`;
      message += `Aguardo confirmação do pagamento e envio! 🙏`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      clearCart();
      setIsSubmitting(false);
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Navigate back to store
      navigate('/store');
    } catch (err) {
      console.error("Error processing order:", err);
      setIsSubmitting(false);
      alert("Houve um problema ao processar seu pedido. Tente novamente.");
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen text-white font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-white/10 gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white uppercase tracking-widest mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar à loja
          </button>
          <h1 className="text-3xl font-serif italic text-white">Checkout <span className="text-orange-500 font-sans not-italic font-bold">Seguro</span></h1>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2.5 rounded-none text-[10px] uppercase tracking-widest font-mono text-white/70">
          <Lock className="w-4 h-4 text-green-400" />
          <span>Ambiente Criptografado 256-bit SSL</span>
        </div>
      </div>

      <form onSubmit={handleFinalizeOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Form Column (Steps) */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Step 1: Customer Data */}
          <div className="bg-white/[0.02] border border-white/10 p-6 sm:p-8 relative">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-black text-xs font-bold flex items-center justify-center font-mono">1</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Dados de Identificação & Contato</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Nome Completo *</Label>
                <Input
                  required
                  placeholder="Ex: Gabriel Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">E-mail para Confirmação *</Label>
                <Input
                  required
                  type="email"
                  placeholder="seuemail@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">CPF *</Label>
                <Input
                  required
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">WhatsApp / Telefone para Atualizações de Envio *</Label>
                <Input
                  required
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className="bg-white/[0.02] border border-white/10 p-6 sm:p-8 relative">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-black text-xs font-bold flex items-center justify-center font-mono">2</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Endereço de Entrega</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">CEP *</Label>
                <div className="relative">
                  <Input
                    required
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    onBlur={handleCepBlur}
                    className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                  />
                  {loadingCep && <span className="absolute right-3 top-3 text-[10px] text-orange-400 font-mono animate-pulse">Buscando...</span>}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Rua / Logradouro *</Label>
                <Input
                  required
                  placeholder="Rua, Avenida, Alameda..."
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Número *</Label>
                <Input
                  required
                  placeholder="123"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Complemento (Apto, Bloco)</Label>
                <Input
                  placeholder="Apto 42, Bloco B"
                  value={formData.complement}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Bairro *</Label>
                <Input
                  required
                  placeholder="Bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">Cidade *</Label>
                <Input
                  required
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-white/50">UF / Estado *</Label>
                <Input
                  required
                  placeholder="SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="bg-white/5 border-white/10 h-11 text-sm rounded-none focus:border-orange-500 uppercase text-white"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Shipping Option */}
          <div className="bg-white/[0.02] border border-white/10 p-6 sm:p-8 relative">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-black text-xs font-bold flex items-center justify-center font-mono">3</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Método de Envio</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setShippingOption("sedex")}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-4 ${
                  shippingOption === "sedex" 
                    ? "bg-orange-500/10 border-orange-500 text-white" 
                    : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                <Truck className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase">SEDEX Expresso</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {isFreeShipping ? "GRÁTIS" : "R$ 19,90"}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40">Prazo de entrega: 2 a 4 dias úteis</p>
                </div>
              </div>

              <div 
                onClick={() => setShippingOption("pac")}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-4 ${
                  shippingOption === "pac" 
                    ? "bg-orange-500/10 border-orange-500 text-white" 
                    : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                <Truck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase">PAC Padrão</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {isFreeShipping ? "GRÁTIS" : "R$ 9,90"}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40">Prazo de entrega: 5 a 8 dias úteis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Payment Info */}
          <div className="bg-white/[0.02] border border-white/10 p-6 sm:p-8 relative">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-black text-xs font-bold flex items-center justify-center font-mono">4</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Pagamento via WhatsApp</h2>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-sm font-bold text-white">Finalize seu pedido pelo WhatsApp</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Ao clicar em "Enviar Pedido via WhatsApp", você será redirecionado para o WhatsApp da SZ Multimarcas com todos os detalhes do seu pedido. Lá você combinará a forma de pagamento e receberá as instruções para finalizar a compra.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-green-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Atendimento rápido e personalizado</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-green-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pagamento seguro via PIX ou Cartão</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-green-500 text-black hover:bg-green-600 rounded-none text-xs uppercase tracking-[0.3em] font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl"
          >
            {isSubmitting ? (
              <span>Processando...</span>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                Enviar Pedido via WhatsApp (R$ {finalTotal.toLocaleString('pt-BR')})
              </>
            )}
          </Button>

        </div>

        {/* Right Order Summary Sticky Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">
            
            <div className="bg-white/[0.02] border border-white/10 p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Resumo do Pedido</h3>
                <span className="text-[10px] font-mono text-white/40">{cart.length} itens</span>
              </div>

              {/* Items Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 divide-y divide-white/5">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="w-12 h-14 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate uppercase">{item.name}</p>
                      <p className="text-[9px] text-white/40 font-mono uppercase">
                        Tam: {item.size} | Cor: {item.color} | Qtd: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-white shrink-0">
                      R$ {(item.price * item.quantity).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                </div>

                {couponDiscountValue > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Cupom ({coupon})</span>
                    <span>-R$ {couponDiscountValue.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex justify-between text-white/60">
                  <span>Frete ({shippingOption.toUpperCase()})</span>
                  <span>{shippingCost === 0 ? <strong className="text-green-400">GRÁTIS</strong> : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}</span>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-white/10 text-sm">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block font-sans">Valor Total</span>
                    <span className="text-2xl font-bold text-white">R$ {finalTotal.toLocaleString('pt-BR')}</span>
                  </div>
                  {couponDiscountValue > 0 && <span className="text-[9px] text-green-400 bg-green-500/10 px-2 py-1 border border-green-500/20 uppercase font-bold">Economizou R$ {couponDiscountValue.toFixed(2).replace('.', ',')}</span>}
                </div>
              </div>

            </div>

            {/* Trust Seals */}
            <div className="bg-white/[0.01] border border-white/5 p-4 space-y-3">
              <div className="flex items-center gap-3 text-[10px] text-white/60 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Garantia de Entrega & Troca Grátis até 7 Dias</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/60 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Rastreamento em Tempo Real via WhatsApp</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/60 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>SZ MULTIMARCAS — Curadoria de Luxo Oficial</span>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
