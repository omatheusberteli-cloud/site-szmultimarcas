import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Star, 
  Truck, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle2, 
  Percent, 
  Sparkles,
  ChevronRight,
  MessageCircle
} from "lucide-react";
import { Button } from '../../components/ui/button';
import { ProductService } from '../services/product.service';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { IMAGES } from "../constants/images";

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      setLoading(true);
      try {
        const { products, error } = await ProductService.getFeaturedProducts(8);
        if (products) {
          setFeaturedProducts(products);
        }
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedProducts();
  }, []);

  const categoriesCircles = [
    { name: "Bonés", cat: "bone", img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&q=80" },
    { name: "Calças", cat: "calça", img: "https://images.unsplash.com/photo-1542272604-780c36856842?w=300&q=80" },
    { name: "Camisa", cat: "camisa", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&q=80" },
    { name: "Camisas de Time", cat: "camisa-time", img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80" },
    { name: "Camisas Street", cat: "camisa-street", img: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=300&q=80" },
    { name: "Gola Polo", cat: "gola-polo", img: "https://images.unsplash.com/photo-1625910513413-5fc45b64e95a?w=300&q=80" },
    { name: "Jaquetas", cat: "jaquetas", img: IMAGES.categories.jaquetas },
    { name: "Óculos", cat: "oculos", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&q=80" },
    { name: "Relógios", cat: "relogios", img: IMAGES.categories.relogios },
    { name: "Shorts", cat: "shorts", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&q=80" },
    { name: "Tênis", cat: "tenis", img: IMAGES.categories.tenis },
  ];

  const testimonials = [
    {
      name: "Lucas Alencar",
      location: "São Paulo, SP",
      rating: 5,
      text: "Atendimento sensacional pelo WhatsApp! As camisas chegaram em 2 dias via SEDEX. Tecido pesado de alta qualidade.",
      product: "Conjunto Streetwear SZ Black"
    },
    {
      name: "Matheus Freitas",
      location: "Rio de Janeiro, RJ",
      rating: 5,
      text: "Gostei muito do desconto de 5% no PIX! Já comprei 3 vezes e sempre chega tudo muito bem embalado com brinde.",
      product: "Jaqueta Puffer Multimarcas"
    },
    {
      name: "Rodrigo Mendonça",
      location: "Belo Horizonte, MG",
      rating: 5,
      text: "Relógio e sneakers 100% autênticos! Recomendo de olhos fechados pra quem curte estilo premium.",
      product: "Sneakers SZ Limited Edition"
    },
  ];

  return (
    <div className="w-full text-gray-900 font-sans pt-8">
      
      {/* Hero Banner Slider */}
      <section className="relative h-[85vh] min-h-[550px] w-full flex items-center justify-center overflow-hidden bg-gray-100">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.55 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={IMAGES.hero.main} 
            alt="SZ Streetwear Collection" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-gray-900/60" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-6">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif italic uppercase tracking-tight leading-[0.95] text-white"
          >
            SEU ESTILO <br />
            <span className="font-sans not-italic font-extrabold text-orange-500">FALA POR VOCÊ</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto uppercase tracking-widest font-mono"
          >
            Peças selecionadas • Entrega rápida • Garantia de autenticidade
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Button 
              onClick={() => navigate('/store')}
              size="lg" 
              className="rounded-none bg-gray-900 text-white hover:bg-orange-500 transition-all px-10 h-14 text-[10px] uppercase tracking-[0.3em] font-extrabold group shadow-2xl"
            >
              Explorar Lançamentos
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button 
              onClick={() => navigate('/store?cat=camisa')}
              size="lg" 
              className="rounded-none border border-gray-300 bg-white/60 hover:bg-gray-900 hover:text-white text-gray-900 transition-all px-8 h-14 text-[10px] uppercase tracking-[0.3em] font-extrabold shadow-xl"
            >
              Ver Coleção Camisas
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
