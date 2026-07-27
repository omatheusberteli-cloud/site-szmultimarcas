import { useState, useEffect } from "react";
import { UserProfile, Product, Category } from '../types';
import { ProductService } from '../services/product.service';
import { supabase } from '../lib/supabase';
import { motion } from "motion/react";
import { Plus, Trash2, Edit3, X, Package, TrendingUp, Users, RefreshCw, ShieldCheck, DollarSign, ArrowUpRight, ShoppingBag, Terminal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Textarea } from "../../components/ui/textarea";
import { IMAGES } from "../constants/images";

const SIZE_OPTIONS = ['P', 'M', 'G', 'GG', 'XG', '38', '39', '40', '41', '42', '43', '44', '46'];
const COLOR_OPTIONS = ['Preto', 'Branco', 'Cinza', 'Azul Marinho', 'Verde Militar', 'Bege', 'Bordô', 'Caramelo'];

interface AdminProps {
  profile: UserProfile | null;
}

export default function Admin({ profile }: AdminProps) {
  console.log('Admin component mounted. Profile:', profile || 'undefined');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'camisa',
    stock: 10,
    description: '',
    imageUrl: '',
    images: [],
    sizes: [],
    colors: [],
    sku: ''
  });

  const [imageInput, setImageInput] = useState('');
  const [editImageInput, setEditImageInput] = useState('');

  // 1. Fetch products & orders
  useEffect(() => {
    console.log('Admin useEffect - fetching data');
    async function fetchData() {
      try {
        console.log('Fetching products...');
        const { products, error } = await ProductService.getProducts({}, 1, 100);
        if (error) {
          console.error('Error from ProductService:', error);
          setError('Erro ao carregar produtos: ' + error.message);
          return;
        }
        if (products) {
          console.log('Products loaded:', products.length);
          setProducts(products);
        }
        // Orders will be fetched when OrderService is implemented
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError('Erro ao carregar dados do admin: ' + (err as Error).message);
      }
    }
    fetchData();
  }, []);

  // Proactive Access Guard logic
  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505]">
        <h2 className="text-2xl font-display uppercase mb-4 text-orange-500">Carregando Perfil...</h2>
        <p className="text-white/40 max-w-xs text-sm">Verificando permissões de acesso.</p>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505]">
        <h2 className="text-2xl font-display uppercase mb-4 text-orange-500">Acesso Restrito</h2>
        <p className="text-white/40 max-w-xs text-sm mb-4">Apenas curadores oficiais da SZ Multimarcas podem acessar o painel de inventário.</p>
        <p className="text-white/30 text-xs">Seu perfil atual: {profile.role}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505]">
        <h2 className="text-2xl font-display uppercase mb-4 text-red-500">Erro ao Carregar</h2>
        <p className="text-white/40 max-w-md text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 text-black text-xs uppercase tracking-widest font-bold hover:bg-orange-400 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // 2. Calculations for Registered Items
  const totalRegisteredProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalInventoryValuation = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);

  // 3. Calculations for Sold Items (Orders)
  const totalOrdersCount = orders.length;
  const totalRevenueAccrued = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalUnitsSoldCount = orders.reduce((acc, o) => {
    const qty = o.items?.reduce((s: number, item: any) => s + (item.quantity || 1), 0) || 0;
    return acc + qty;
  }, 0);

  // Form Adding Helpers
  const addImageUrl = () => {
    if (imageInput && !newProductForm.images?.includes(imageInput)) {
      setNewProductForm(prev => ({
        ...prev,
        images: [...(prev.images || []), imageInput],
        imageUrl: prev.imageUrl || imageInput
      }));
      setImageInput('');
    }
  };

  const removeImageUrl = (url: string) => {
    setNewProductForm(prev => ({
      ...prev,
      images: prev.images?.filter(u => u !== url) || []
    }));
  };

  const toggleSize = (size: string) => {
    setNewProductForm(prev => ({
      ...prev,
      sizes: prev.sizes?.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...(prev.sizes || []), size]
    }));
  };

  const toggleColor = (color: string) => {
    setNewProductForm(prev => ({
      ...prev,
      colors: prev.colors?.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...(prev.colors || []), color]
    }));
  };

  // Form Editing Helpers
  const addEditImageUrl = () => {
    if (editImageInput && !editingProduct?.images?.includes(editImageInput)) {
      setEditingProduct(prev => prev ? ({
        ...prev,
        images: [...(prev.images || []), editImageInput],
        imageUrl: prev.imageUrl || editImageInput
      }) : null);
      setEditImageInput('');
    }
  };

  const removeEditImageUrl = (url: string) => {
    setEditingProduct(prev => prev ? ({
      ...prev,
      images: prev.images?.filter(u => u !== url) || []
    }) : null);
  };

  const toggleEditSize = (size: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const currentSizes = prev.sizes || [];
      return {
        ...prev,
        sizes: currentSizes.includes(size)
          ? currentSizes.filter(s => s !== size)
          : [...currentSizes, size]
      };
    });
  };

  const toggleEditColor = (color: string) => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const currentColors = prev.colors || [];
      return {
        ...prev,
        colors: currentColors.includes(color)
          ? currentColors.filter(c => c !== color)
          : [...currentColors, color]
      };
    });
  };

  // Database Commits
  const handleAddProduct = async () => {
    console.log('Tentando cadastrar produto:', newProductForm);
    if (!newProductForm.name) {
      console.error('Validação falhou: nome vazio');
      return;
    }
    
    try {
      // Generate automatic SKU if not provided
      let sku = newProductForm.sku;
      if (!sku) {
        const categoryPrefix = newProductForm.category === 'camisa' ? 'CAM' :
                             newProductForm.category === 'jaquetas' ? 'JAC' :
                             newProductForm.category === 'tenis' ? 'TEN' :
                             newProductForm.category === 'relogios' ? 'REL' :
                             newProductForm.category === 'calça' ? 'CAL' :
                             newProductForm.category === 'bone' ? 'BON' :
                             newProductForm.category === 'bermuda' ? 'BER' :
                             newProductForm.category === 'oculos' ? 'OCU' :
                             newProductForm.category === 'sandalias' ? 'SAN' : 'PRO';
        
        // Find existing SKUs with this prefix
        const existingSkus = products
          .filter((p: any) => p.sku && p.sku.startsWith(categoryPrefix))
          .map((p: any) => {
            const match = p.sku.match(new RegExp(`^${categoryPrefix}-(\\d+)$`));
            return match ? parseInt(match[1], 10) : 0;
          });
        
        const maxNumber = existingSkus.length > 0 ? Math.max(...existingSkus) : 0;
        sku = `${categoryPrefix}-${(maxNumber + 1).toString().padStart(3, '0')}`;
      }
      
      // Get category_id from category name
      const categorySlug = newProductForm.category;
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      
      const categoryId = categoryData?.id || null;
      
      const productData = {
        name: newProductForm.name,
        description: newProductForm.description || '',
        price: Number(newProductForm.price),
        stock_quantity: Number(newProductForm.stock),
        sku: sku,
        image_url: newProductForm.imageUrl || newProductForm.images[0],
        images: newProductForm.images || [],
        sizes: newProductForm.sizes || [],
        colors: newProductForm.colors || [],
        category_id: categoryId,
        is_active: true,
        is_featured: false,
        slug: newProductForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      };
      
      console.log('Dados enviados para Supabase:', productData);
      
      const result = await ProductService.createProduct(productData as any);
      console.log('Resultado do createProduct:', result);
      
      if (result.error) {
        console.error('Erro ao criar produto:', result.error);
        alert('Erro ao cadastrar produto: ' + result.error.message);
        return;
      }
      
      setNewProductForm({
        name: '',
        price: 0,
        category: 'camisa',
        stock: 10,
        description: '',
        images: [],
        sizes: [],
        colors: [],
        sku: ''
      });
      setShowAddForm(false);
      // Refresh products
      const { products } = await ProductService.getProducts({}, 1, 100);
      if (products) setProducts(products);
      
      console.log('Produto cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro no handleAddProduct:', error);
      alert('Erro ao cadastrar produto: ' + (error as Error).message);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct?.id || !editingProduct.name) return;
    
    // Get category_id from category name
    const categorySlug = editingProduct.category;
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    const categoryId = categoryData?.id || null;
    
    await ProductService.updateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      stock_quantity: Number(editingProduct.stock),
      description: editingProduct.description || '',
      imageUrl: editingProduct.imageUrl || editingProduct.images?.[0] || '',
      images: editingProduct.images || [],
      sizes: editingProduct.sizes || [],
      colors: editingProduct.colors || [],
      sku: editingProduct.sku || '',
      category_id: categoryId
    } as any);
    setEditingProduct(null);
    setShowEditForm(false);
    // Refresh products
    const { products } = await ProductService.getProducts({}, 1, 100);
    if (products) setProducts(products);
  };

  const handleSeed = async () => {
    const initialProducts: any[] = [
      { 
        name: 'Camisa Linho Noir', 
        price: 289, 
        category: 'camisa', 
        stock: 15, 
        description: 'Elegante camisa de linho para noites de verão.', 
        images: [IMAGES.placeholders.product],
        sizes: ['M', 'G', 'GG'],
        colors: ['Preto', 'Bege'],
        sku: 'SZ-CAM-001'
      },
      { 
        name: 'Chrono Platinum', 
        price: 2450, 
        category: 'relogios', 
        stock: 4, 
        description: 'Movimento automático suíço com pulseira em couro legítimo.', 
        images: [IMAGES.categories.relogios],
        sizes: ['Único'],
        colors: ['Prata', 'Preto'],
        sku: 'SZ-WAT-55'
      },
      { 
        name: 'Runner Carbon-8', 
        price: 690, 
        category: 'tenis', 
        stock: 12, 
        description: 'Alta performance com design urbano futurista.', 
        images: [IMAGES.categories.tenis],
        sizes: ['40', '41', '42'],
        colors: ['Cinza', 'Preto'],
        sku: 'SZ-SHW-09'
      }
    ];

    for (const p of initialProducts) {
      await ProductService.createProduct({
        ...p,
        imageUrl: p.images[0],
        stock_quantity: p.stock,
        is_active: true,
        is_featured: false,
      } as any);
    }
    // Refresh products
    const { products } = await ProductService.getProducts({}, 1, 100);
    if (products) setProducts(products);
  };

  return (
    <div className="pt-32 px-8 min-h-screen pb-24 bg-[#050505]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 border-b border-white/5 pb-10">
        <div>
          <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1">Administrative Control Layer</p>
          <h1 className="text-4xl font-serif italic text-white">Manager <span className="text-orange-500 underline underline-offset-8 decoration-white/10">Dashboard</span></h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSeed} className="rounded-none border-white/10 text-white/50 hover:border-orange-500/50 hover:text-white text-[10px] uppercase tracking-widest h-10 px-6 backdrop-blur-md">
            <RefreshCw className="w-3 h-3 mr-2" /> Alimentar Banc de Dados
          </Button>
          
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white text-black hover:bg-orange-500 hover:text-white rounded-none text-[10px] uppercase tracking-widest h-10 px-6 font-bold"
          >
            <Plus className="w-3 h-3 mr-2" /> {showAddForm ? 'Cancelar' : 'Cadastrar Novo Item'}
          </Button>
        </div>
      </div>

      {/* Real balances of registered products & dynamic sales */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
        {[
          { label: 'Modelos Cadastrados', value: totalRegisteredProducts, icon: Package, color: 'text-orange-500' },
          { label: 'Unidades em Estoque', value: totalStockUnits, icon: ShieldCheck, color: 'text-blue-400' },
          { label: 'Valor em Inventário', value: `R$ ${totalInventoryValuation.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-neutral-300' },
          { label: 'Vendas Acumuladas', value: `R$ ${totalRevenueAccrued.toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Peças Descarregadas', value: totalUnitsSoldCount, icon: ShoppingBag, color: 'text-orange-500' },
          { label: 'Transações Emitidas', value: totalOrdersCount, icon: Terminal, color: 'text-blue-400' }
        ].map((stat, i) => (stat &&
          <div key={i} className="bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-center opacity-40">
              <span className="text-[9px] uppercase tracking-widest font-mono text-white">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-light tracking-tighter text-white font-mono break-words">{stat.value}</p>
            <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Integrated Add Product Form */}
      {showAddForm && !showEditForm && (
        <div className="bg-white/[0.02] border border-white/10 p-12 mb-16">
          <div className="mb-10">
            <h2 className="text-3xl font-serif italic uppercase tracking-widest text-white">Novo Produto</h2>
            <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] mt-2">Preencha os parâmetros para a sincronização</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Info */}
            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Nome do Produto</Label>
                <Input 
                  placeholder="Ex: Polo Pique de Algodão" 
                  className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({...newProductForm, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Preço (BRL)</Label>
                  <Input 
                    type="number" 
                    className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                    value={newProductForm.price}
                    onChange={e => setNewProductForm({...newProductForm, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Estoque Inicial</Label>
                  <Input 
                    type="number" 
                    className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                    value={newProductForm.stock}
                    onChange={e => setNewProductForm({...newProductForm, stock: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Código SKU</Label>
                  <Input 
                    placeholder="SZ-CAM-10" 
                    className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                    value={newProductForm.sku}
                    onChange={e => setNewProductForm({...newProductForm, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Categoria</Label>
                  <select 
                    className="w-full bg-[#0E0E0E] text-white border border-white/10 p-4 h-14 text-sm focus:border-orange-500 outline-none"
                    value={newProductForm.category}
                    onChange={e => setNewProductForm({...newProductForm, category: e.target.value as Category})}
                  >
                    <option value="camisa">Camisa</option>
                    <option value="jaquetas">Jaqueta</option>
                    <option value="tenis">Tênis</option>
                    <option value="relogios">Relógio</option>
                    <option value="calça">Calça</option>
                    <option value="bone">Boné</option>
                    <option value="bermuda">Bermuda</option>
                    <option value="oculos">Óculos</option>
                    <option value="sandalias">Sandálias</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">História & Descrição detalhada</Label>
                <Textarea 
                  className="bg-white/5 border-white/10 rounded-none min-h-[150px] focus:border-orange-500 text-[#FFF] text-sm"
                  value={newProductForm.description}
                  onChange={e => setNewProductForm({...newProductForm, description: e.target.value})}
                />
              </div>
            </div>

            {/* Right Column: Variations & Media */}
            <div className="space-y-10">
              <div className="space-y-4">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Mídias do Produto (URLs)</Label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Insira a URL e clique em (+)" 
                    className="bg-white/5 border-white/10 rounded-none h-12 text-sm text-white"
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                  />
                  <Button 
                    onClick={addImageUrl}
                    variant="outline" 
                    className="h-12 px-6 border-white/10 hover:bg-white hover:text-black shrink-0 text-xs uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {newProductForm.images?.map((url, i) => (
                    <div key={i} className="group relative w-20 h-20 bg-neutral-950 border border-white/10">
                      <img src={url} className="w-full h-full object-cover opacity-60" />
                      <button 
                        onClick={() => removeImageUrl(url)}
                        className="absolute inset-0 bg-red-600/80 items-center justify-center hidden group-hover:flex"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Grade de Tamanhos</Label>
                <div className="flex flex-wrap gap-3">
                  {SIZE_OPTIONS.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 text-xs border transition-all ${
                        newProductForm.sizes?.includes(size)
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Cores Disponíveis</Label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`px-4 py-2 text-xs border transition-all ${
                        newProductForm.colors?.includes(color)
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <Button 
              className="w-full bg-white text-black h-16 rounded-none hover:bg-orange-500 hover:text-white text-xs uppercase tracking-[0.3em] font-bold text-lg"
              onClick={handleAddProduct}
            >
              Gravar no Banco de Dados
            </Button>
          </div>
        </div>
      )}

      {/* Integrated Edit Product Form */}
      {showEditForm && editingProduct && (
        <div className="bg-white/[0.02] border border-white/10 p-12 mb-16">
          <div className="mb-10">
            <h2 className="text-3xl font-serif italic uppercase tracking-widest text-white">Editar Produto ({editingProduct.name})</h2>
            <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] mt-2">Altere os vetores de armazenamento do estoque</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Info */}
            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Nome do Produto</Label>
                <Input 
                  placeholder="Nome do produto" 
                  className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                  value={editingProduct.name || ""}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Preço (BRL)</Label>
                  <Input 
                    type="number" 
                    className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                    value={editingProduct.price || 0}
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Estoque do Item</Label>
                  <Input 
                    type="number" 
                    className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                    value={editingProduct.stock || 0}
                    onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Código SKU</Label>
                  <Input 
                    placeholder="SKU" 
                    className="bg-white/5 border-white/10 rounded-none h-14 focus:border-orange-500 text-sm text-white"
                    value={editingProduct.sku || ""}
                    onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-white/40">Categoria</Label>
                  <select 
                    className="w-full bg-[#0E0E0E] text-white border border-white/10 p-4 h-14 text-sm focus:border-orange-500 outline-none"
                    value={editingProduct.category || "camisa"}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})}
                  >
                    <option value="camisa">Camisa</option>
                    <option value="jaquetas">Jaqueta</option>
                    <option value="tenis">Tênis</option>
                    <option value="relogios">Relógio</option>
                    <option value="calça">Calça</option>
                    <option value="bone">Boné</option>
                    <option value="bermuda">Bermuda</option>
                    <option value="oculos">Óculos</option>
                    <option value="sandalias">Sandálias</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">História & Descrição detalhada</Label>
                <Textarea 
                  className="bg-white/5 border-white/10 rounded-none min-h-[150px] focus:border-orange-500 text-white text-sm"
                  value={editingProduct.description || ""}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
            </div>

            {/* Right Column: Variations & Media */}
            <div className="space-y-10">
              <div className="space-y-4">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Mídias do Produto (URLs)</Label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Insira a URL e clique em (+)" 
                    className="bg-white/5 border-white/10 rounded-none h-12 text-sm text-white"
                    value={editImageInput}
                    onChange={e => setEditImageInput(e.target.value)}
                  />
                  <Button 
                    onClick={addEditImageUrl}
                    variant="outline" 
                    className="h-12 px-6 border-white/10 hover:bg-white hover:text-black shrink-0 text-xs uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {editingProduct.images?.map((url, i) => (
                    <div key={i} className="group relative w-20 h-20 bg-neutral-950 border border-white/10">
                      <img src={url} className="w-full h-full object-cover opacity-60" />
                      <button 
                        onClick={() => removeEditImageUrl(url)}
                        className="absolute inset-0 bg-red-600/80 items-center justify-center hidden group-hover:flex"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Grade de Tamanhos</Label>
                <div className="flex flex-wrap gap-3">
                  {SIZE_OPTIONS.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleEditSize(size)}
                      className={`px-4 py-2 text-xs border transition-all ${
                        editingProduct.sizes?.includes(size)
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] uppercase tracking-widest text-white/40">Cores Disponíveis</Label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleEditColor(color)}
                      className={`px-4 py-2 text-xs border transition-all ${
                        editingProduct.colors?.includes(color)
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex gap-4">
            <Button 
              className="flex-1 rounded-none border border-white/15 hover:bg-white/5 text-xs uppercase tracking-widest font-mono text-white/50 h-16"
              onClick={() => {
                setShowEditForm(false);
                setEditingProduct(null);
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-white text-black h-16 rounded-none hover:bg-orange-500 hover:text-white text-xs uppercase tracking-[0.3em] font-bold text-lg"
              onClick={handleUpdateProduct}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      )}

      {/* Main Inventory Controller List */}
      <div>
        <div className="mb-8">
          <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1">Database Sync Register</p>
          <h2 className="text-2xl font-serif italic text-white">Catálogo de <span className="text-orange-500 underline underline-offset-4 decoration-white/10">Estoque</span></h2>
        </div>

        <div className="bg-white/[0.01] border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10 text-[9px] uppercase tracking-[0.2em] text-white/30 font-mono">
              <tr>
                <th className="px-8 py-5">Item do Sistema</th>
                <th className="px-8 py-5">Classificação / SKU</th>
                <th className="px-8 py-5">Valoração (Unit.)</th>
                <th className="px-8 py-5 text-center">Peças</th>
                <th className="px-8 py-5 text-right">Métricas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] tracking-widest font-medium">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-neutral-900 overflow-hidden border border-white/10">
                        <img src={product.imageUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white uppercase group-hover:text-orange-500 transition-colors">{product.name}</span>
                        <span className="text-[8px] font-mono opacity-30">ID: {product.id.slice(0,10).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-white/40">{product.category}</span>
                      <span className="text-[8px] font-mono text-white/20 mt-1">{product.sku || 'NÃO CONFIGURADO'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-white/80">R$ {product.price.toLocaleString('pt-BR')}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`font-mono text-sm ${(product.stock || 0) < 5 ? 'text-orange-500 font-bold' : 'text-white/60'}`}>{(product.stock || 0).toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setShowEditForm(true);
                          setShowAddForm(false);
                        }}
                        className="p-2 hover:bg-white/10 text-white/60 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          await ProductService.deleteProduct(product.id);
                          const { products } = await ProductService.getProducts({}, 1, 100);
                          if (products) setProducts(products);
                        }}
                        className="p-2 hover:bg-orange-500/20 text-orange-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Transactions Balance / Registros de Pedidos */}
      <div className="mt-16">
        <div className="mb-8">
          <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1">Consolidated Operational Register</p>
          <h2 className="text-2xl font-serif italic text-white">Conselho de <span className="text-orange-500 underline underline-offset-4 decoration-white/10">Vendas & Pedidos</span></h2>
        </div>

        {orders.length === 0 ? (
          <div className="border border-white/5 bg-white/[0.01] p-16 text-center text-white/35 text-[10px] uppercase tracking-[0.2em] font-mono">
            Nenhuma venda registrada no banco de dados.
          </div>
        ) : (
          <div className="bg-white/[0.01] border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10 text-[9px] uppercase tracking-[0.2em] text-white/30 font-mono">
                <tr>
                  <th className="px-8 py-5">Código Venda</th>
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5">Produtos / Grade</th>
                  <th className="px-8 py-5">Local Logístico Map</th>
                  <th className="px-8 py-5 text-right">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] tracking-widest font-mono">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors leading-relaxed">
                    <td className="px-8 py-5 font-bold text-white/70">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-8 py-5 font-sans">
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-semibold uppercase">{order.customerName}</span>
                        <span className="text-[10px] opacity-40 lowercase font-mono">{order.userEmail}</span>
                        <span className="text-[9px] opacity-40 font-mono">{order.phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-sans">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs text-white/80">
                          {item.quantity}x {item.name} <span className="text-[10px] text-orange-400 font-mono">({item.size} / {item.color})</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-8 py-5 font-sans text-white/50 text-xs">
                      {order.address}
                    </td>
                    <td className="px-8 py-5 text-right text-green-400 font-bold">
                      R$ {order.total?.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
