import React, { useEffect } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Truck, 
  Clock, 
  MessageSquare, 
  ShoppingBag, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  PackageCheck
} from "lucide-react";
import { Button } from '../../components/ui/button';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });
  }, []);

  const handleCopyPix = () => {
    const pixCode = `00020126580014br.gov.bcb.pix0136szmultimarcas-${orderId}5204000053039865802BR5920SZ MULTIMARCAS LTDA6009SAO PAULO62070503***`;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppTracking = () => {
    const phone = "5527998499540";
    const text = `Olá! Gostaria de acompanhar o meu pedido *#${orderId?.slice(0, 8).toUpperCase()}* realizado na SZ Multimarcas.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-8 max-w-4xl mx-auto text-white min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/[0.02] border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden mb-8"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <p className="text-[10px] uppercase tracking-[0.4em] text-orange-400 font-mono mb-2">Pedido Registrado com Sucesso</p>
        <h1 className="text-3xl sm:text-4xl font-serif italic text-white mb-2">
          Obrigado pela sua <span className="font-sans not-italic font-bold text-orange-500">Compra!</span>
        </h1>
        <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
          Código da Transação: <span className="text-white font-bold">#{orderId?.toUpperCase()}</span>
        </p>

        {/* Timeline */}
        <div className="grid grid-cols-3 gap-2 mt-10 pt-8 border-t border-white/10 max-w-lg mx-auto text-[9px] uppercase tracking-wider font-mono">
          <div className="text-center text-green-400">
            <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2 animate-ping" />
            <span>1. Pedido Criado</span>
          </div>
          <div className="text-center text-orange-400">
            <div className="w-3 h-3 rounded-full bg-orange-500 mx-auto mb-2" />
            <span>2. Separação VIP</span>
          </div>
          <div className="text-center text-white/30">
            <div className="w-3 h-3 rounded-full bg-white/20 mx-auto mb-2" />
            <span>3. Envio SEDEX</span>
          </div>
        </div>
      </motion.div>

      {/* Payment Action if PIX */}
      {order?.paymentMethod === 'pix' && (
        <div className="bg-black/60 border border-green-500/30 p-8 mb-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest font-mono">
            <Clock className="w-4 h-4" />
            Aguardando Confirmação do Pagamento PIX
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="bg-white p-3 border-2 border-green-500 shadow-xl">
              <QRCodeSVG value={`00020126580014br.gov.bcb.pix0136szmultimarcas-${orderId}`} size={150} />
            </div>

            <div className="text-left space-y-3 max-w-xs">
              <p className="text-xs text-white/70 leading-relaxed">
                Escaneie o código QR acima no aplicativo do seu banco ou copie a chave de pagamento abaixo para aprovação instantânea.
              </p>
              <Button 
                onClick={handleCopyPix}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold h-10 text-[10px] uppercase tracking-widest rounded-none flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Código PIX Copiado!" : "Copiar Chave Pix Copia e Cola"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/[0.02] border border-white/10 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-400" /> Endereço de Envio
          </h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            <strong>{order?.customerName || "Cliente"}</strong><br />
            {order?.address || "Endereço cadastrado"}<br />
            Contato: {order?.phone || ""}
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-green-400" /> Rastreamento
          </h3>
          <p className="text-xs text-white/70 leading-relaxed font-mono">
            Código de Rastreio: <strong className="text-orange-400">{order?.trackingCode || "SZ982318231BR"}</strong><br />
            <span className="text-[10px] text-white/40 uppercase block mt-1">Você receberá atualizações via WhatsApp e e-mail.</span>
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={handleWhatsAppTracking}
          className="w-full sm:w-auto h-12 bg-green-500 hover:bg-green-400 text-black font-bold text-[10px] uppercase tracking-widest rounded-none px-8 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Acompanhar no WhatsApp
        </Button>

        <Button
          onClick={() => window.print()}
          variant="outline"
          className="w-full sm:w-auto h-12 border-white/20 text-white hover:bg-white/10 font-bold text-[10px] uppercase tracking-widest rounded-none px-8 flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir Comprovante
        </Button>

        <Button
          onClick={() => navigate('/store')}
          className="w-full sm:w-auto h-12 bg-white text-black hover:bg-orange-500 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-none px-8 flex items-center justify-center gap-2"
        >
          Continuar Comprando
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}
